import { supabaseAdmin } from '../config/database.js'
import dotenv from 'dotenv'

dotenv.config()

async function runMigrations() {
  console.log('Starting migrations...')

  try {
    // 1. Create users table
    console.log('Creating users table...')
    await supabaseAdmin.rpc('run_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY,
          email VARCHAR UNIQUE NOT NULL,
          account_type VARCHAR NOT NULL CHECK (account_type IN ('student', 'organizer', 'admin')),
          first_name VARCHAR,
          last_name VARCHAR,
          bio TEXT,
          interests TEXT[],
          profile_picture_url VARCHAR,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `,
    })

    // 2. Create opportunities table
    console.log('Creating opportunities table...')
    await supabaseAdmin.rpc('run_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS opportunities (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR NOT NULL,
          description TEXT NOT NULL,
          category VARCHAR NOT NULL,
          location VARCHAR,
          deadline DATE,
          requirements TEXT[],
          created_by UUID NOT NULL REFERENCES users(id),
          status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `,
    })

    // 3. Create bookmarks table
    console.log('Creating bookmarks table...')
    await supabaseAdmin.rpc('run_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS bookmarks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, opportunity_id)
        );
      `,
    })

    // 4. Create applications table
    console.log('Creating applications table...')
    await supabaseAdmin.rpc('run_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS applications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
          status VARCHAR DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'accepted', 'rejected')),
          cover_letter TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, opportunity_id)
        );
      `,
    })

    // 5. Create notifications table
    console.log('Creating notifications table...')
    await supabaseAdmin.rpc('run_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR NOT NULL,
          title VARCHAR NOT NULL,
          message TEXT,
          read BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `,
    })

    console.log('✅ Migrations completed successfully!')
  } catch (error) {
    console.error('❌ Migration error:', error.message)
    process.exit(1)
  }
}

runMigrations()
