import { supabase } from './supabaseClient.js'

async function test() {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .limit(1)

  if (error) {
    console.error('Supabase connection check failed:', error.message)
    return
  }

  console.log('Supabase connection check passed.', data)
}

test()
