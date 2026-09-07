// app/init-db.server.ts
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Initialize SQLite database on app startup if it doesn't exist
 * For LiteFS, we just ensure Prisma can generate the client
 * The actual database file creation and migrations are handled by LiteFS via litefs.yml
 */
export function initializeDatabase() {
  const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './dev.db';
  
  console.log(`Database configured at: ${dbPath}`);
  
  // For LiteFS, we don't need to manually create the database file
  // LiteFS will handle the file system and the litefs.yml config handles migrations
  // We just need to ensure Prisma client is generated
  
  try {
    // In development, still create local db file
    if (process.env.NODE_ENV !== 'production' && !fs.existsSync(dbPath)) {
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      fs.writeFileSync(dbPath, '');
      
      execSync('npx prisma db push --skip-generate', { 
        stdio: 'inherit',
        env: { ...process.env }
      });
      
      console.log('Development database initialized');
    } else {
      console.log('Production: LiteFS will handle database initialization');
    }
  } catch (error) {
    console.error('Error with database initialization:', error);
    // Don't crash the app - LiteFS should handle this
  }
}
