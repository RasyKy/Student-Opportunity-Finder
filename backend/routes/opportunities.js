import express from 'express'
import { supabase, supabaseAdmin } from '../config/database.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// Get all opportunities (with search and filter)
router.get('/', async (req, res) => {
  try {
    const { search, filter, category, page = 1, limit = 10 } = req.query

    let query = supabase.from('opportunities').select('*')

    // Search
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Filter by category
    if (category) {
      query = query.eq('category', category)
    }

    // Filter by status (only show active opportunities)
    query = query.eq('status', 'active')

    // Pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({
      data,
      pagination: {
        page,
        limit,
        total: count,
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single opportunity
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('opportunities').select('*').eq('id', req.params.id).single()

    if (error) {
      return res.status(404).json({ error: 'Opportunity not found' })
    }

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create opportunity (Organizer only)
router.post('/', authenticate, authorize(['organizer', 'admin']), async (req, res) => {
  try {
    const { title, description, category, location, deadline, requirements } = req.body

    const { data, error } = await supabaseAdmin
      .from('opportunities')
      .insert([
        {
          title,
          description,
          category,
          location,
          deadline,
          requirements,
          created_by: req.user.id,
          status: 'active',
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.status(201).json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update opportunity (Creator or Admin only)
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Check if user owns the opportunity or is admin
    const { data: opportunity, error: fetchError } = await supabase
      .from('opportunities')
      .select('created_by')
      .eq('id', req.params.id)
      .single()

    if (fetchError || !opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' })
    }

    if (opportunity.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this opportunity' })
    }

    const { title, description, category, location, deadline, requirements, status } = req.body

    const { data, error } = await supabaseAdmin
      .from('opportunities')
      .update({ title, description, category, location, deadline, requirements, status })
      .eq('id', req.params.id)
      .select()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete opportunity (Creator or Admin only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { data: opportunity, error: fetchError } = await supabase
      .from('opportunities')
      .select('created_by')
      .eq('id', req.params.id)
      .single()

    if (fetchError || !opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' })
    }

    if (opportunity.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this opportunity' })
    }

    const { error } = await supabaseAdmin.from('opportunities').delete().eq('id', req.params.id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({ message: 'Opportunity deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
