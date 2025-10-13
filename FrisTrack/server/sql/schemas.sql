#Création de la base de données
CREATE DATABASE fristrack;

#Se connecter à la base de données
USE fristrack;

#Création des tables
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    pseudo VARCHAR(50) UNIQUE,
    birthdate DATE NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_weight FLOAT,
    user_height FLOAT,
    foot_size DECIMAL(2,0),
    dominant_hand ENUM('left', 'right', 'ambidextrous'),
    profile_picture VARCHAR(255),
    user_type ENUM('playeronly', 'coach') DEFAULT 'playeronly',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stats_player_match (
    stat_id INT AUTO_INCREMENT PRIMARY KEY,
    max_speed FLOAT(3,1) COMMENT 'in km/h',
    avg_speed FLOAT(3,1) COMMENT 'in km/h',
    max_jump_height FLOAT(4,3) DEFAULT 0 COMMENT 'in meters',
    total_passes INT DEFAULT 0,
    total_assits INT DEFAULT 0,
    disk_lost INT DEFAULT 0,
    strength_weakness VARCHAR(250) COMMENT 'Description of player strengths and weaknesses from the coach',
    attack_success FLOAT(3,2) DEFAULT 0 COMMENT '% of successful attacks',
    def_success FLOAT(3,2) DEFAULT 0 COMMENT '% of successful defenses',
    minutes_played INT DEFAULT 0,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE localisation (
    gps_data VARCHAR(20) PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE match_frisbee (
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    match_date DATETIME NOT NULL,
    score VARCHAR(5) DEFAULT '0-0',
    length_match TIMESTAMP DEFAULT '00:00:00',
    weigth_match INT DEFAULT 0 COMMENT 'en octets',
    arbitrator VARCHAR(100) DEFAULT 'no arbitrator',
    label ENUM('finished','schedule') DEFAULT 'schedule',
    in_outdoor ENUM('indoor','outdoor') DEFAULT 'outdoor',
    title_match VARCHAR(100) NOT NULL,
    gps_data VARCHAR(20) NOT NULL,
    FOREIGN KEY (gps_data) REFERENCES localisation(gps_data),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(50) NOT NULL,
    logo VARCHAR(255),
    coach_id INT,
    FOREIGN KEY (coach_id) REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_team (
    user_id INT,
    team_id INT,
    UNIQUE KEY unique_user_team (user_id, team_id),
    role_attack ENUM('back', 'stack'),
    role_def ENUM('chien','zone'),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (team_id) REFERENCES team(team_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_match (
    team_id INT,
    match_id INT,
    home_away_team ENUM('home', 'away'),
    UNIQUE KEY unique_match_team (match_id, team_id),
    FOREIGN KEY (team_id) REFERENCES team(team_id),
    FOREIGN KEY (match_id) REFERENCES match_frisbee(match_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)


#Insertion des données
INSERT INTO users (
    firstname,
    lastname,
    pseudo,
    birthdate,
    email,
    password_hash,
    user_weight,
    user_height,
    foot_size,
    dominant_hand,
    profile_picture,
    user_type
) VALUES (
    'Cyril',
    'Lamand',
    'Crocrodile',
    '2002-10-19',
    'c.lamand@students.ephec.be',
    '$2y$10$ExempleDeHashDeMotDePasse1234567890', -- Exemple bcrypt
    92.0,
    1.86,
    43,
    'right',
    'profile_pics/crocro.jpg',
    'playeronly'
),
(
    'Alexis',
    'DEMARCQ',
    'Saint-Patic',
    '2003-08-04',
    'a.demarcq@students.ephec.be',
    '$2y$10$ExempleDeHashDeMotDePasse0987654321', -- Exemple bcrypt
    85.0,
    1.86,
    43,
    'right',
    'profile_pics/alexis.jpg',
    'playeronly'
),
(
    'Nathan',
    'Lemaire',
    'Naifu',
    '2003-07-30',
    'n.lemaire@students.ephec.be',
    '$2y$10$ExempleDeHashDeMotDePasse1122334455', -- Exemple bcrypt
    52.5,
    1.57,
    37,
    'right',
    'profile_pics/nathan.jpg',
    'playeronly'
),
(
    'Antoine',
    'Bontemps',
    'ZosiscoVI',
    '2005-11-27',
    'a.bontemps@students.ephec.be',
    '$2y$10$ExempleDeHashDeMotDePasse5566778899', -- Exemple bcrypt
    75.0,
    1.79,
    44,
    'right',
    'profile_pics/antoine.jpg',
    'playeronly'
),
(
    'Jiale',
    'Wu',
    'Panda',
    '2003-06-08',
    'j.wu@students.ephec.be',
    '$2y$10$ExempleDeHashDeMotDePasse6677889900', -- Exemple bcrypt
    100.0,
    1.83,
    43,
    'right',
    'profile_pics/jiale.jpg',
    'playeronly'
),
(
    'Aloïs',
    'Charlier',
    'Alo',
    '2004-01-01',
    'a.charlier@students.ephec.be',
    '$2y$10$ExempleDeHashDeMotDePasse1234567890', -- Exemple bcrypt
    80.0,
    1.90,
    45,
    'right',
    'profile_pics/alo.jpg',
    'coach'
);
INSERT INTO team (team_name, logo, coach_id) VALUES
('EPHEC Ultimate', 'team_logos/ephec_ultimate.png', 6);

