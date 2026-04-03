const db = require('./db');

const syncSchema = async () => {
    console.log('[MIGRATION] Starting database synchronization...');
    
    try {
        // 1. Ensure core tables exist (Idempotent)
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'owner',
                hotel_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS hotels (
                id SERIAL PRIMARY KEY,
                owner_id INTEGER REFERENCES users(id),
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                location TEXT,
                logo_url TEXT,
                upi_id VARCHAR(255),
                subscription_amount DECIMAL(10,2) DEFAULT 0,
                subscription_valid_until TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS tables (
                id SERIAL PRIMARY KEY,
                hotel_id INTEGER REFERENCES hotels(id),
                table_number VARCHAR(50) NOT NULL,
                capacity INTEGER DEFAULT 4,
                status VARCHAR(20) DEFAULT 'available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Add missing columns to existing tables (Migrations)
        const migrations = [
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'owner'",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS phone VARCHAR(20)",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS location TEXT",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS logo_url TEXT",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS upi_id VARCHAR(255)",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS subscription_amount DECIMAL(10,2) DEFAULT 0",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS subscription_valid_until TIMESTAMP",
            "ALTER TABLE tables ADD COLUMN IF NOT EXISTS floor VARCHAR(50) DEFAULT 'Floor 1'",
            "ALTER TABLE tables ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 4",
            "ALTER TABLE tables DROP CONSTRAINT IF EXISTS tables_hotel_id_table_number_key",
            "ALTER TABLE tables ADD CONSTRAINT tables_hotel_id_table_number_floor_key UNIQUE (hotel_id, table_number, floor)"
        ];

        for (const q of migrations) {
            try {
                await db.query(q);
            } catch (e) {
                console.warn(`[MIGRATION] Step skipped: ${q} - ${e.message}`);
            }
        }

        console.log('[MIGRATION] Database schema is up to date.');
    } catch (err) {
        console.error('[MIGRATION] Schema sync failed:', err.message);
        // We don't exit the process here to allow the server to still start if possible
    }
};

module.exports = { syncSchema };
