import express from 'express'
import { supabase, supabaseAdmin } from '../config/database.js'
import { body, validationResult } from 'express-validator'

const router = express.Router()

// Register - Student or Organizer
router.post('/register', [
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('accountType').isIn(['student', 'organizer']).withMessage('Invalid account type'),
  body('firstName').notEmpty().trim().escape(),
  body('lastName').notEmpty().trim().escape()
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const { email, password, accountType, firstName, lastName } = req.body

    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    })

    if (authError) {
      return res.status(400).json({ error: authError.message })
    }

    // Create user profile in database
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: authUser.user.id,
          email,
          account_type: accountType,
          first_name: firstName,
          last_name: lastName,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (profileError) {
      return res.status(400).json({ error: profileError.message })
    }

    res.status(201).json({
      message: 'User registered successfully. Please log in.',
      user: profile[0],
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Login
router.post('/login', [
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const { email, password } = req.body

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    res.json({
      message: 'Login successful',
      token: data.session.access_token,
      user: profile,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Logout
router.post('/logout', async (req, res) => {
  try {
    await supabase.auth.signOut()
    res.json({ message: 'Logout successful' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
