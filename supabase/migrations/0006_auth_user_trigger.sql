-- 1. Create a function to handle new auth users and create their profiles automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, plan)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'free'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = new.email,
    name = coalesce(profiles.name, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger to execute public.handle_new_user() on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill all existing users from auth.users to public.profiles
INSERT INTO public.profiles (id, name, email, plan)
SELECT 
  id,
  coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  email,
  'free'
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET 
  email = excluded.email,
  name = coalesce(profiles.name, excluded.name);
