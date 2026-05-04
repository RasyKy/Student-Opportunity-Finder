import express from 'express'
import { supabase, supabaseAdmin } from '../config/database.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Get user profile
router.get('/profile/:id', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', req.params.id).single()

    if (error) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update user profile
router.put('/profile/:id', authenticate, async (req, res) => {
  try {
    // Users can only update their own profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const { first_name, last_name, bio, interests, profile_picture_url } = req.body

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        first_name,
        last_name,
        bio,
        interests,
        profile_picture_url,
        updated_at: new Date().toISOString(),
      })
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

// Get user bookmarks
router.get('/:id/bookmarks', authenticate, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const { data, error } = await supabase
      .from('bookmarks')
      .select('opportunity_id, opportunities(*)')
      .eq('user_id', req.params.id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Add bookmark
router.post('/:id/bookmarks', authenticate, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const { opportunity_id } = req.body

    const { data, error } = await supabaseAdmin
      .from('bookmarks')
      .insert([
        {
          user_id: req.params.id,
          opportunity_id,
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

// Remove bookmark
router.delete('/:id/bookmarks/:opportunityId', authenticate, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    const { error } = await supabaseAdmin
      .from('bookmarks')
      .delete()
      .eq('user_id', req.params.id)
      .eq('opportunity_id', req.params.opportunityId)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({ message: 'Bookmark removed' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
