#!/bin/bash
# Create initial migration for users table

# Make sure we're in the backend directory
cd /Users/t.tanaka/Documents/claude/money-dairy-lovers/backend

# Create the migration
docker compose -f ../docker-compose.dev.yml exec backend alembic revision --autogenerate -m "Add users table"

echo "Migration created. Run 'make migrate' to apply it."