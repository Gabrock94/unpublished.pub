-- Enable RLS on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow unauthenticated users to read published projects
CREATE POLICY "Allow public read published projects" ON projects
  FOR SELECT
  USING (published = true);

-- Policy 2: Allow authenticated users to update their own projects
CREATE POLICY "Allow users to update their own projects" ON projects
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Policy 3: Allow authenticated users to delete their own projects
CREATE POLICY "Allow users to delete their own projects" ON projects
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- Policy 4: Allow authenticated users to insert projects (via Edge Function or direct)
CREATE POLICY "Allow authenticated users to insert projects" ON projects
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Enable RLS on sessions table (no policies = default-deny)
-- Edge Functions with SERVICE_ROLE_KEY bypass RLS, so they still work
-- This prevents any accidental access via anon key as an extra security layer
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
