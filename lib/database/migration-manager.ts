import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/observability/logger"
import fs from "fs/promises"
import path from "path"

interface Migration {
  id: string
  name: string
  version: number
  checksum: string
  executed_at?: Date
  rollback_sql?: string
}

export class MigrationManager {
  private supabase = createClient()

  async initializeMigrationTable() {
    const { error } = await this.supabase.rpc("create_migration_table")
    if (error) {
      logger.error("Failed to initialize migration table", error)
      throw error
    }
  }

  async getMigrationHistory(): Promise<Migration[]> {
    const { data, error } = await this.supabase
      .from("schema_migrations")
      .select("*")
      .order("version", { ascending: true })

    if (error) {
      logger.error("Failed to get migration history", error)
      throw error
    }

    return data || []
  }

  async executeMigration(migrationFile: string): Promise<void> {
    try {
      const migrationPath = path.join(process.cwd(), "scripts", migrationFile)
      const sql = await fs.readFile(migrationPath, "utf-8")

      // Calculate checksum for integrity
      const checksum = this.calculateChecksum(sql)

      // Execute migration in transaction
      const { error } = await this.supabase.rpc("execute_migration", {
        migration_name: migrationFile,
        migration_sql: sql,
        migration_checksum: checksum,
      })

      if (error) {
        logger.error(`Migration ${migrationFile} failed`, error)
        throw error
      }

      logger.info(`Migration ${migrationFile} executed successfully`)
    } catch (error) {
      logger.error(`Failed to execute migration ${migrationFile}`, error as Error)
      throw error
    }
  }

  async rollbackMigration(migrationId: string): Promise<void> {
    const { data: migration, error: fetchError } = await this.supabase
      .from("schema_migrations")
      .select("*")
      .eq("id", migrationId)
      .single()

    if (fetchError || !migration) {
      throw new Error(`Migration ${migrationId} not found`)
    }

    if (!migration.rollback_sql) {
      throw new Error(`No rollback script available for migration ${migrationId}`)
    }

    const { error } = await this.supabase.rpc("rollback_migration", {
      migration_id: migrationId,
      rollback_sql: migration.rollback_sql,
    })

    if (error) {
      logger.error(`Rollback failed for migration ${migrationId}`, error)
      throw error
    }

    logger.info(`Migration ${migrationId} rolled back successfully`)
  }

  private calculateChecksum(content: string): string {
    const crypto = require("crypto")
    return crypto.createHash("sha256").update(content).digest("hex")
  }
}
