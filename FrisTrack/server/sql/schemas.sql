CREATE DATABASE fristrack;
USE fristrack;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    birthdate DATE NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    user_weight FLOAT,
    user_height FLOAT,
    foot_size FLOAT,
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
    minutes_played INT DEFAULT 0
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE match (
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
    role_attack ENUM('back', 'stack'),
    role_def ENUM('chien','zone')
    PRIMARY KEY (user_id, team_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (team_id) REFERENCES team(team_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE team_match (
    team_id INT,
    match_id INT,
    home_away_team ENUM('home', 'away'),
    PRIMARY KEY (team_id, match_id),
    FOREIGN KEY (team_id) REFERENCES team(team_id),
    FOREIGN KEY (match_id) REFERENCES match(match_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

CREATE TABLE localisation (
    gps_data VARCHAR(20) PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);