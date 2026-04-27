-- PixelWars Database Schema

-- Drop existing tables if they exist
DROP TABLE IF EXISTS capture_log CASCADE;
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#6366f1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blocks table
CREATE TABLE blocks (
    id SERIAL PRIMARY KEY,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(x, y)
);

-- Capture log table
CREATE TABLE capture_log (
    id SERIAL PRIMARY KEY,
    block_id INTEGER REFERENCES blocks(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_blocks_coordinates ON blocks(x, y);
CREATE INDEX idx_blocks_user_id ON blocks(user_id);
CREATE INDEX idx_capture_log_user ON capture_log(user_id);
CREATE INDEX idx_capture_log_time ON capture_log(captured_at);

-- Insert sample data
-- Create some demo users
INSERT INTO users (username, color) VALUES 
    ('PixelKing', '#ef4444'),
    ('BlockMaster', '#3b82f6'),
    ('GridNinja', '#10b981'),
    ('TileWizard', '#f59e0b'),
    ('CellSniper', '#8b5cf6');

-- Create a 50x30 grid with some pre-captured blocks
DO $$
DECLARE
    x_var INTEGER;
    y_var INTEGER;
    user_ids INTEGER[];
BEGIN
    -- Get all user ids
    SELECT ARRAY_AGG(id) INTO user_ids FROM users;
    
    -- Create some random blocks (about 5% of grid)
    FOR i IN 1..750 LOOP
        x_var := floor(random() * 50)::INTEGER;
        y_var := floor(random() * 30)::INTEGER;
        
        INSERT INTO blocks (x, y, user_id)
        VALUES (x_var, y_var, user_ids[1 + floor(random() * array_length(user_ids, 1))::INTEGER])
        ON CONFLICT (x, y) DO NOTHING;
    END LOOP;
END $$;

-- Create view for leaderboard
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
    u.id,
    u.username,
    u.color,
    COUNT(b.id) as block_count,
    MAX(b.captured_at) as last_capture
FROM users u
LEFT JOIN blocks b ON b.user_id = u.id
GROUP BY u.id, u.username, u.color
ORDER BY COUNT(b.id) DESC;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;