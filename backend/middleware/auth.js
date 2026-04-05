import { supabase } from '../config/database.js'

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Get user profile for roles
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('account_type')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return res.status(401).json({ error: 'User profile not found' })
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: profile.account_type,
    }
    
    req.supabaseUser = user
    next()
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed', details: error.message })
  }
}

export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }
    next()
  }
}
