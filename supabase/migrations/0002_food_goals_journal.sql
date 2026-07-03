-- Create food logs table
CREATE TABLE IF NOT EXISTS food_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snacks')),
  food_name TEXT,
  calories INTEGER NOT NULL DEFAULT 0,
  protein INTEGER NOT NULL DEFAULT 0,
  carbs INTEGER NOT NULL DEFAULT 0,
  fats INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create water logs table
CREATE TABLE IF NOT EXISTS water_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  amount_liters NUMERIC(4,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('Career', 'Health', 'Personal', 'Finance', 'Skills', 'Habits')),
  progress INTEGER DEFAULT 0,
  value_label TEXT, -- e.g., "18 / 24 Books", "$45k / $60k Savings"
  status TEXT DEFAULT 'In Progress' CHECK (status IN ('On Track', 'Completed', 'In Progress', 'Behind')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  due_date TEXT, -- e.g., "Oct 15"
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create journal logs table
CREATE TABLE IF NOT EXISTS journal_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  entry_text TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('focused', 'happy', 'tired', 'stressed')),
  reflection_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create planner events table
CREATE TABLE IF NOT EXISTS planner_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
  time_slot TEXT NOT NULL, -- e.g., "08:00 AM"
  event_title TEXT NOT NULL,
  description TEXT, -- e.g., "Project A"
  duration TEXT, -- e.g., "1h 30m"
  day_date INTEGER NOT NULL, -- day number, e.g. 28, 29, 30
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
