const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve('c:/Users/shubh/Desktop/BestBill/backend/.env') });

const dbPath = path.resolve('c:/Users/shubh/Desktop/BestBill/backend/src/db/db.js');
const db = require(dbPath); 

async function migrate() { 
  try { 
    console.log('Initiating Database Structural Audit...');
    
    // Add columns if they don't exist
    await db.query(`
      ALTER TABLE hotels 
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS upi_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS gst_percentage DECIMAL(5,2) DEFAULT 5.00
    `);

    console.log('--- STRUCTURAL INTEGRITY VERIFIED ---');
    console.log('Columns [address, upi_id, gst_percentage] are now provisioned.');
    process.exit(0); 
  } catch(e) { 
    console.error('MIGRATION ERROR:', e); 
    process.exit(1); 
  } 
} 
migrate();
