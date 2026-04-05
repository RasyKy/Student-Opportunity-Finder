-- RLS Policies for USERS table
-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND account_type = 'admin')
  );

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for OPPORTUNITIES table
-- Allow anyone to read active opportunities
CREATE POLICY "Anyone can read active opportunities" ON opportunities
  FOR SELECT USING (status = 'active' OR created_by = auth.uid());

-- Allow organizers and admins to create opportunities
CREATE POLICY "Organizers and admins can create opportunities" ON opportunities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND account_type IN ('organizer', 'admin')
    )
  );

-- Allow organizers to update their own opportunities, admins can update all
CREATE POLICY "Users can update own opportunities" ON opportunities
  FOR UPDATE USING (
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND account_type = 'admin')
  );

-- Allow organizers to delete their own opportunities, admins can delete all
CREATE POLICY "Users can delete own opportunities" ON opportunities
  FOR DELETE USING (
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND account_type = 'admin')
  );

-- RLS Policies for BOOKMARKS table
-- Users can only see their own bookmarks
CREATE POLICY "Users can read own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only create bookmarks for themselves
CREATE POLICY "Users can create own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for APPLICATIONS table
-- Users can read their own applications
CREATE POLICY "Users can read own applications" ON applications
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM opportunities 
      WHERE opportunities.id = opportunity_id AND opportunities.created_by = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND account_type = 'admin')
  );

-- Users can only apply to opportunities themselves
CREATE POLICY "Users can apply to opportunities" ON applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own applications
CREATE POLICY "Users can update own applications" ON applications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for NOTIFICATIONS table
-- Users can only read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
