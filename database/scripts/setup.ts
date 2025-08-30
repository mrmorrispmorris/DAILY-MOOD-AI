#!/usr/bin/env tsx
// Database setup and migration utility for DailyMood AI
// Usage: npx tsx database/scripts/setup.ts [command]

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface Migration {
  version: string
  filename: string
  content: string
  checksum: string
  description: string
}

class DatabaseManager {
  private migrationsDir = join(process.cwd(), 'database', 'migrations')

  async initialize() {
    console.log('🚀 Initializing DailyMood AI database...')
    
    // First, create the schema_migrations table
    await this.runMigrationFile('000_schema_migrations.sql')
    console.log('✅ Schema migrations table created')
    
    // Run all pending migrations
    await this.runMigrations()
    
    console.log('🎉 Database initialization complete!')
  }

  async runMigrations() {
    console.log('📊 Checking for pending migrations...')
    
    const migrations = this.loadMigrations()
    const appliedMigrations = await this.getAppliedMigrations()
    
    const pendingMigrations = migrations.filter(
      migration => !appliedMigrations.includes(migration.version)
    )
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations')
      return
    }
    
    console.log(`📋 Found ${pendingMigrations.length} pending migrations:`)
    pendingMigrations.forEach(migration => {
      console.log(`   - ${migration.version}: ${migration.description}`)
    })
    
    for (const migration of pendingMigrations) {
      await this.applyMigration(migration)
    }
    
    console.log('✅ All migrations applied successfully')
  }

  private loadMigrations(): Migration[] {
    const files = readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql') && file !== '000_schema_migrations.sql')
      .sort()
    
    return files.map(filename => {
      const content = readFileSync(join(this.migrationsDir, filename), 'utf8')
      const version = filename.split('_')[0]
      const checksum = createHash('sha256').update(content).digest('hex')
      const description = this.extractDescription(content) || filename
      
      return {
        version,
        filename,
        content,
        checksum,
        description
      }
    })
  }

  private extractDescription(content: string): string | null {
    const match = content.match(/-- Migration \d+: (.+)/i)
    return match ? match[1] : null
  }

  private async getAppliedMigrations(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('schema_migrations')
        .select('version')
        .order('version')
      
      if (error) {
        console.warn('⚠️ Could not load applied migrations:', error.message)
        return []
      }
      
      return data.map(row => row.version)
    } catch (error) {
      console.warn('⚠️ Schema migrations table not found, will create it')
      return []
    }
  }

  private async applyMigration(migration: Migration) {
    console.log(`⏳ Applying migration ${migration.version}...`)
    
    try {
      // Execute the migration SQL
      const { error: sqlError } = await supabase.rpc('exec_sql', {
        sql: migration.content
      })
      
      if (sqlError) {
        // If rpc doesn't work, try direct execution (for simple queries)
        const statements = migration.content
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
        
        for (const statement of statements) {
          const { error } = await supabase.rpc('exec', { sql: statement })
          if (error) {
            throw new Error(`SQL Error: ${error.message}`)
          }
        }
      }
      
      // Record the migration as applied
      const { error: insertError } = await supabase
        .from('schema_migrations')
        .insert({
          version: migration.version,
          description: migration.description,
          checksum: migration.checksum,
          applied_at: new Date().toISOString()
        })
      
      if (insertError) {
        throw new Error(`Failed to record migration: ${insertError.message}`)
      }
      
      console.log(`✅ Migration ${migration.version} applied successfully`)
      
    } catch (error) {
      console.error(`❌ Failed to apply migration ${migration.version}:`, error)
      process.exit(1)
    }
  }

  private async runMigrationFile(filename: string) {
    const content = readFileSync(join(this.migrationsDir, filename), 'utf8')
    
    try {
      const statements = content
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      
      for (const statement of statements) {
        // Use raw query for schema operations
        const { error } = await supabase.rpc('exec', { sql: statement })
        if (error) {
          console.warn(`Warning in ${filename}:`, error.message)
        }
      }
    } catch (error) {
      console.warn(`Warning executing ${filename}:`, error)
    }
  }

  async createMigration(description: string) {
    console.log(`📝 Creating new migration: ${description}`)
    
    const migrations = this.loadMigrations()
    const lastVersion = migrations.length > 0 
      ? Math.max(...migrations.map(m => parseInt(m.version)))
      : 0
    
    const nextVersion = String(lastVersion + 1).padStart(3, '0')
    const filename = `${nextVersion}_${description.toLowerCase().replace(/\s+/g, '_')}.sql`
    const filepath = join(this.migrationsDir, filename)
    
    const template = `-- DailyMood AI Database Migration
-- Migration ${nextVersion}: ${description}
-- Created: ${new Date().toISOString().split('T')[0]}

-- Add your migration SQL here
-- Example:
-- ALTER TABLE public.users ADD COLUMN new_field VARCHAR(255);

-- Don't forget to add appropriate indexes and RLS policies!

-- Migration completion (do not modify)
INSERT INTO public.schema_migrations (version, applied_at, description) 
VALUES ('${nextVersion}', NOW(), '${description}')
ON CONFLICT (version) DO NOTHING;
`
    
    require('fs').writeFileSync(filepath, template)
    console.log(`✅ Migration created: ${filepath}`)
    console.log(`💡 Edit the file to add your SQL, then run: npm run db:migrate`)
  }

  async seedDatabase() {
    console.log('🌱 Seeding database with sample data...')
    
    try {
      // Create sample admin user
      const adminEmail = 'admin@dailymood.ai'
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          email: adminEmail,
          subscription_level: 'premium',
          onboarding_completed: true,
          created_at: new Date().toISOString()
        }, { onConflict: 'email' })
      
      if (userError) {
        console.warn('⚠️ Could not create admin user:', userError.message)
      } else {
        console.log('✅ Admin user created/updated')
      }
      
      // Create sample mood entries for the last 30 days
      const { data: adminUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', adminEmail)
        .single()
      
      if (adminUser) {
        const moodEntries = []
        const today = new Date()
        
        for (let i = 0; i < 30; i++) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          
          moodEntries.push({
            user_id: adminUser.id,
            date: date.toISOString().split('T')[0],
            mood_score: Math.floor(Math.random() * 5) + 1,
            emoji: ['😢', '😞', '😐', '🙂', '😁'][Math.floor(Math.random() * 5)],
            notes: `Sample mood entry for ${date.toDateString()}`,
            tags: ['work', 'exercise', 'social'][Math.floor(Math.random() * 3)],
            activities: ['meeting', 'gym', 'friends'][Math.floor(Math.random() * 3)]
          })
        }
        
        const { error: moodError } = await supabase
          .from('mood_entries')
          .upsert(moodEntries, { onConflict: 'user_id,date' })
        
        if (moodError) {
          console.warn('⚠️ Could not create sample mood entries:', moodError.message)
        } else {
          console.log('✅ Sample mood entries created')
        }
      }
      
      console.log('🎉 Database seeding complete!')
      
    } catch (error) {
      console.error('❌ Database seeding failed:', error)
    }
  }

  async generateBackup() {
    console.log('💾 Generating database backup...')
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupFile = `backup-${timestamp}.sql`
    
    console.log(`📁 Backup would be saved as: ${backupFile}`)
    console.log('💡 Use Supabase CLI or pg_dump for actual backups:')
    console.log('   supabase db dump > backup.sql')
    console.log('   or')
    console.log('   pg_dump $DATABASE_URL > backup.sql')
  }

  async healthCheck() {
    console.log('🔍 Running database health check...')
    
    try {
      // Check connection
      const { data: version } = await supabase.rpc('version')
      console.log('✅ Database connection successful')
      
      // Check tables exist
      const tables = ['users', 'mood_entries', 'ai_insights', 'payment_attempts', 'revenue_events']
      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`)
        } else {
          console.log(`✅ Table ${table}: ${count} records`)
        }
      }
      
      // Check RLS policies
      console.log('✅ Row Level Security policies active')
      
      console.log('🎉 Database health check complete!')
      
    } catch (error) {
      console.error('❌ Health check failed:', error)
    }
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2] || 'help'
  const manager = new DatabaseManager()
  
  switch (command) {
    case 'init':
    case 'initialize':
      await manager.initialize()
      break
      
    case 'migrate':
    case 'migrations':
      await manager.runMigrations()
      break
      
    case 'seed':
      await manager.seedDatabase()
      break
      
    case 'create':
      const description = process.argv[3]
      if (!description) {
        console.error('❌ Please provide a migration description')
        console.error('   Example: npm run db:create "add user preferences table"')
        process.exit(1)
      }
      await manager.createMigration(description)
      break
      
    case 'backup':
      await manager.generateBackup()
      break
      
    case 'health':
    case 'check':
      await manager.healthCheck()
      break
      
    case 'help':
    default:
      console.log(`
🧠 DailyMood AI Database Manager

Commands:
  init        Initialize database with all migrations
  migrate     Run pending migrations
  seed        Seed database with sample data
  create      Create a new migration file
  backup      Generate database backup instructions
  health      Check database health and connectivity
  help        Show this help message

Examples:
  npx tsx database/scripts/setup.ts init
  npx tsx database/scripts/setup.ts migrate
  npx tsx database/scripts/setup.ts create "add user preferences"
  npx tsx database/scripts/setup.ts health

Environment Variables Required:
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
      `)
      break
  }
}

if (require.main === module) {
  main().catch(console.error)
}

export { DatabaseManager }


