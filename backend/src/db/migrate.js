const db = require('./db');

const syncSchema = async () => {
    console.log('[MIGRATION] Starting database synchronization...');
    
    try {
        // 1. Ensure core tables exist (Idempotent)
        const coreTables = [
            `CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'owner',
                hotel_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS hotels (
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
            )`,
            `CREATE TABLE IF NOT EXISTS rooms (
                id SERIAL PRIMARY KEY, 
                hotel_id integer REFERENCES hotels(id) ON DELETE CASCADE, 
                room_number character varying(50) NOT NULL, 
                room_name character varying(255), 
                floor character varying(50) DEFAULT 'Floor 1', 
                status character varying(50) DEFAULT 'available', 
                created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, 
                UNIQUE (hotel_id, room_number)
            )`,
            `CREATE TABLE IF NOT EXISTS tables (
                id SERIAL PRIMARY KEY,
                hotel_id INTEGER REFERENCES hotels(id),
                table_number VARCHAR(50) NOT NULL,
                capacity INTEGER DEFAULT 4,
                status VARCHAR(20) DEFAULT 'available',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                table_id INTEGER REFERENCES tables(id) ON DELETE CASCADE,
                room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS bills (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                total_amount DECIMAL(10,2) DEFAULT 0,
                gst DECIMAL(10,2) DEFAULT 0,
                final_amount DECIMAL(10,2) DEFAULT 0,
                discount_percentage DECIMAL(5,2) DEFAULT 0,
                is_paid BOOLEAN DEFAULT false,
                payment_method VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                menu_item_id INTEGER REFERENCES menu_items(id),
                quantity INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS order_chats (
                id SERIAL PRIMARY KEY,
                order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                sender VARCHAR(20) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`
        ];

        for (const sql of coreTables) {
            await db.query(sql);
        }

        // 2. Add missing columns to existing tables (Migrations)
        const migrations = [
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'owner'",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS gst_percentage DECIMAL(5,2) DEFAULT 5",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS is_service_stopped BOOLEAN DEFAULT false",
            "ALTER TABLE tables ADD COLUMN IF NOT EXISTS floor VARCHAR(50) DEFAULT 'Floor 1'",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS owner_message TEXT",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_note TEXT",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_delivered BOOLEAN DEFAULT false",
            "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255)",
            "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(20)",
            "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS booking_days INTEGER",
            "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS total_cost DECIMAL(10,2)",
            "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS check_in_date TIMESTAMP",
            "ALTER TABLE bills ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false",
            "ALTER TABLE bills ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20)"
        ];

        for (const q of migrations) {
            try {
                await db.query(q);
            } catch (e) {
                // Ignore errors like "column already exists"
            }
        }

        console.log('[MIGRATION] Database schema is up to date.');
    } catch (err) {
        console.error('[MIGRATION] Schema sync failed:', err.message);
    }
};

module.exports = { syncSchema };
