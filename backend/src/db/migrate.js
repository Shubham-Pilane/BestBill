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

             CREATE TABLE IF NOT EXISTS order_items (
                 id SERIAL PRIMARY KEY,
                 order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                 menu_item_id INTEGER REFERENCES menu_items(id),
                 quantity INTEGER NOT NULL,
                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
             );

             CREATE TABLE IF NOT EXISTS order_chats (
                 id SERIAL PRIMARY KEY,
                 order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                 sender VARCHAR(20) NOT NULL, -- 'owner' or 'guest'
                 message TEXT NOT NULL,
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
            "ALTER TABLE tables ADD CONSTRAINT tables_hotel_id_table_number_floor_key UNIQUE (hotel_id, table_number, floor)",
            "ALTER TABLE hotels ADD COLUMN IF NOT EXISTS is_service_stopped BOOLEAN DEFAULT false",
            "CREATE TABLE IF NOT EXISTS rooms (id SERIAL PRIMARY KEY, hotel_id integer REFERENCES hotels(id) ON DELETE CASCADE, room_number character varying(50) NOT NULL, room_name character varying(255), floor character varying(50) DEFAULT 'Floor 1', status character varying(50) DEFAULT 'available', created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP, UNIQUE (hotel_id, room_number))",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE",
            "ALTER TABLE rooms ADD COLUMN IF NOT EXISTS active_order_id INTEGER REFERENCES orders(id)",
            "CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON rooms(hotel_id)",
            "CREATE INDEX IF NOT EXISTS idx_tables_hotel_id ON tables(hotel_id)",
            "CREATE INDEX IF NOT EXISTS idx_orders_room_id ON orders(room_id)",
            "CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id)",
            "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)",
            "CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS owner_message TEXT",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_note TEXT",
            "ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_delivered BOOLEAN DEFAULT false",
            "ALTER TABLE rooms DROP CONSTRAINT IF EXISTS rooms_hotel_id_room_number_key",
            "ALTER TABLE rooms ADD CONSTRAINT rooms_hotel_id_room_number_key UNIQUE (hotel_id, room_number)"
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
