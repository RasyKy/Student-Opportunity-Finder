-- Create organizer_profiles table
-- verification_status lives here, not on users — keeps users table role-agnostic
CREATE TABLE IF NOT EXISTS organizer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  org_name VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  official_email VARCHAR NOT NULL,
  website_url VARCHAR,
  linkedin_url VARCHAR,
  facebook_url VARCHAR,
  document_url VARCHAR,
  verification_status VARCHAR DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE organizer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own organizer profile" ON organizer_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own organizer profile" ON organizer_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own organizer profile" ON organizer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all organizer profiles" ON organizer_profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- No trigger — each app creates the users row in its own auth callback with the correct role.
