#!/bin/bash

# Load env variables from .env.local if present
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

DB_URL=${DATABASE_URL:-"postgresql://postgres:qp9LYqHLOYFeSRfP@db.kbvyzbcpvwxhtwlxwtjw.supabase.co:5432/postgres"}

echo "Applying migration: 0001_init.sql..."
psql "$DB_URL" -f supabase/migrations/0001_init.sql

echo "Applying migration: 0002_food_goals_journal.sql..."
psql "$DB_URL" -f supabase/migrations/0002_food_goals_journal.sql

echo "Migrations applied successfully!"
