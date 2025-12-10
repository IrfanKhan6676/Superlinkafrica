-- Migration management system
CREATE TABLE IF NOT EXISTS schema_migrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  version INTEGER NOT NULL UNIQUE,
  checksum VARCHAR(64) NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rollback_sql TEXT,
  execution_time_ms INTEGER
);

-- Function to execute migrations safely
CREATE OR REPLACE FUNCTION execute_migration(
  migration_name TEXT,
  migration_sql TEXT,
  migration_checksum TEXT
) RETURNS VOID AS $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  execution_time INTEGER;
BEGIN
  start_time := clock_timestamp();
  
  -- Check if migration already executed
  IF EXISTS (SELECT 1 FROM schema_migrations WHERE name = migration_name) THEN
    RAISE EXCEPTION 'Migration % already executed', migration_name;
  END IF;
  
  -- Execute the migration
  EXECUTE migration_sql;
  
  end_time := clock_timestamp();
  execution_time := EXTRACT(MILLISECONDS FROM (end_time - start_time));
  
  -- Record successful execution
  INSERT INTO schema_migrations (name, version, checksum, execution_time_ms)
  VALUES (
    migration_name,
    COALESCE((SELECT MAX(version) FROM schema_migrations), 0) + 1,
    migration_checksum,
    execution_time
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise
    RAISE EXCEPTION 'Migration % failed: %', migration_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Function to rollback migrations
CREATE OR REPLACE FUNCTION rollback_migration(
  migration_id UUID,
  rollback_sql TEXT
) RETURNS VOID AS $$
BEGIN
  -- Execute rollback
  EXECUTE rollback_sql;
  
  -- Remove from migration history
  DELETE FROM schema_migrations WHERE id = migration_id;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Rollback failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;
