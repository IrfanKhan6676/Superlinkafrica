#!/usr/bin/env node
import { createClient } from "@/lib/supabase/server"
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

// Get the directory name in ES module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Database client
const supabase = createClient()

// Migration interface
interface Migration {
  name: string
  sql: string
}

// Get all migration files
async function getMigrationFiles(): Promise<string[]> {
  const migrationsDir = path.join(__dirname, '..', 'migrations')
  const files = await fs.readdir(migrationsDir)
  return files
    .filter(file => file.endsWith('.sql'))
    .sort() // Sort to ensure they run in order
}

// Read migration file content
async function readMigrationFile(filename: string): Promise<string> {
  const filePath = path.join(__dirname, '..', 'migrations', filename)
  return fs.readFile(filePath, 'utf-8')
}

// Execute a single migration
async function runMigration(name: string, sql: string): Promise<void> {
  console.log(`Running migration: ${name}`)
  
  try {
    const { error } = await supabase.rpc('execute_migration', {
      migration_name: name,
      migration_sql: sql,
      migration_checksum: 'checksum_placeholder' // In a real app, calculate checksum
    })
    
    if (error) throw error
    console.log(`✅ Successfully applied migration: ${name}`)
  } catch (error) {
    console.error(`❌ Failed to apply migration ${name}:`, error)
    process.exit(1)
  }
}

// Main function
async function main() {
  console.log('Starting database migrations...')
  
  try {
    // Check if migrations table exists, if not, create it
    try {
      await supabase.rpc('create_migration_table')
    } catch (error) {
      // If the function doesn't exist, run the initial migration script
      console.log('Initializing migration system...')
      const initialScript = await readMigrationFile('00_migration_system.sql')
      const { error } = await supabase.rpc('execute_sql', { sql: initialScript })
      if (error) throw error
    }
    
    // Get all migration files
    const migrationFiles = await getMigrationFiles()
    console.log(`Found ${migrationFiles.length} migration(s) to run`)
    
    // Run each migration
    for (const file of migrationFiles) {
      const sql = await readMigrationFile(file)
      await runMigration(file, sql)
    }
    
    console.log('✅ All migrations completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    // Close the connection
    await supabase.auth.signOut()
  }
}

// Run the migrations
main()
