#!/bin/bash

# Load env variables from .env.local if present
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

DB_URL=${DATABASE_URL}

if [ -z "$DB_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not defined."
  echo "Please set it in your environment or add it to a .env.local file in this directory."
  exit 1
fi

# Loop through all SQL files in order and apply them
for file in $(ls supabase/migrations/*.sql | sort); do
  echo "Applying migration: $file..."
  psql "$DB_URL" -f "$file"
done

echo "All migrations applied successfully!"
