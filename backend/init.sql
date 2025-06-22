-- Create test database if not exists
SELECT 'CREATE DATABASE money_dairy_lovers_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'money_dairy_lovers_test')\gexec

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";