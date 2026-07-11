-- 1. Policy to allow authenticated users to view their own profile
DROP POLICY IF EXISTS "Users select own profile" ON profiles;
CREATE POLICY "Users select own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid()::text = id);

-- 2. Policy to allow authenticated users to insert their own profile
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
CREATE POLICY "Users insert own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid()::text = id);

-- 3. Policy to allow authenticated users to update their own profile
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);
