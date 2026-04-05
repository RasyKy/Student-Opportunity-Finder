import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const supabaseKey = process.env.SUPABASE_KEY

// Admin client (for server operations with full permissions)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Client (for user operations with RLS policies)
export const supabase = createClient(supabaseUrl, supabaseKey)

export default { supabase, supabaseAdmin }
