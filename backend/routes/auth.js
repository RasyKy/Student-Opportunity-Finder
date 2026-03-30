import express from 'express'
import { supabase, supabaseAdmin } from '../config/database.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const router = express.Router()

// Register - Student or Organizer
router.post('/register', async (req, res) => {
  try {
    const { email, password, accountType, firstName, lastName } = req.body

    // Validate input
    if (!email || !password || !accountType || !['student', 'organizer'].includes(accountType)) {
      return res.status(400).json({ error: 'Invalid input' })
    }

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

    // Generate JWT token
    const token = jwt.sign(
      {
        id: authUser.user.id,
        email,
        role: accountType,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: profile[0],
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

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

    // Generate JWT token
    const token = jwt.sign(
      {
        id: data.user.id,
        email: data.user.email,
        role: profile.account_type,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      message: 'Login successful',
      token,
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
