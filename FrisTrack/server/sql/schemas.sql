-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    team1 VARCHAR(255) NOT NULL,
    team2 VARCHAR(255) NOT NULL,
    score1 INTEGER DEFAULT 0,
    score2 INTEGER DEFAULT 0,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    color VARCHAR(50)
);

-- Match recordings table
CREATE TABLE IF NOT EXISTS match_recordings (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status VARCHAR(50) DEFAULT 'recording',
    data JSONB -- Pour stocker les données de mouvement
);

-- Match positions table (pour les données de suivi de mouvement)
CREATE TABLE IF NOT EXISTS match_positions (
    id SERIAL PRIMARY KEY,
    recording_id INTEGER REFERENCES match_recordings(id) ON DELETE CASCADE,
    timestamp TIMESTAMP NOT NULL,
    player_id INTEGER, -- Optionnel, si nous voulons suivre des joueurs spécifiques
    x FLOAT NOT NULL,
    y FLOAT NOT NULL,
    z FLOAT NOT NULL -- Pour les données 3D
);
