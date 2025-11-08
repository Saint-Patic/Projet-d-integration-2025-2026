DELIMITER $$

-- 1) Met à jour les infos de base (prenom, nom, birthdate, email)
CREATE PROCEDURE update_user_basic (
    IN p_user_id INT,
    IN p_firstname VARCHAR(50),
    IN p_lastname VARCHAR(50),
    IN p_pseudo VARCHAR(50),
    IN p_birthdate DATE,
    IN p_email VARCHAR(100)
)
BEGIN
    DECLARE cnt INT DEFAULT 0;
    -- Vérifier unicité de l'email (autre utilisateur)
    SELECT COUNT(*) INTO cnt FROM users WHERE email = p_email AND user_id <> p_user_id;
    IF cnt > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Email deja utilise';
    ELSE
        UPDATE users
        SET firstname = p_firstname,
            lastname = p_lastname,
            pseudo = p_pseudo,
            birthdate = p_birthdate,
            email = p_email
        WHERE user_id = p_user_id;
    END IF;
END$$


-- 2) Met à jour le mot de passe (p_password_hash doit être déjà haché)
CREATE PROCEDURE update_user_password (
    IN p_user_id INT,
    IN p_password_hash VARCHAR(255)
)
BEGIN
    UPDATE users
    SET password_hash = p_password_hash
    WHERE user_id = p_user_id;
END$$


-- 3) Met à jour des champs du profil (poids/taille/pointure/main dominante/pseudo/photo)
CREATE PROCEDURE update_user_profile (
    IN p_user_id INT,
    IN p_user_weight FLOAT,
    IN p_user_height FLOAT,
    IN p_foot_size FLOAT,
    IN p_dominant_hand ENUM('left','right','ambidextrous'),
    IN p_pseudo VARCHAR(50),
    IN p_profile_picture VARCHAR(255)
)
BEGIN
    UPDATE users
    SET user_weight = p_user_weight,
        user_height = p_user_height,
        foot_size = p_foot_size,
        dominant_hand = p_dominant_hand,
        pseudo = p_pseudo,
        profile_picture = p_profile_picture
    WHERE user_id = p_user_id;
END$$


-- 4) Changer le type d'utilisateur (playeronly / coach)
CREATE PROCEDURE update_user_type (
    IN p_user_id INT,
    IN p_user_type ENUM('playeronly','coach')
)
BEGIN
    UPDATE users
    SET user_type = p_user_type
    WHERE user_id = p_user_id;
END$$

-- 5) Récupérer tous les matchs
CREATE PROCEDURE get_all_matches()
BEGIN
    SELECT 
        m.match_id AS id,
        t1.team_name AS team_name_1,
        t2.team_name AS team_name_2,
        tm1.score AS team_score_1,
        tm2.score AS team_score_2,
        tm1.home_away_team AS team1_status,
        tm2.home_away_team AS team2_status,
        m.match_date AS date
    FROM match_frisbee m
    JOIN team_match tm1 ON m.match_id = tm1.match_id
    JOIN team_match tm2 ON m.match_id = tm2.match_id AND tm1.team_id <> tm2.team_id
    JOIN team t1 ON tm1.team_id = t1.team_id
    JOIN team t2 ON tm2.team_id = t2.team_id
    WHERE tm1.home_away_team = 'home' AND tm2.home_away_team = 'away';
END$$

-- 6) Récupérer un match par ID
CREATE PROCEDURE get_match_by_id(IN p_match_id INT)
BEGIN
    SELECT 
        m.match_id AS id,
        t1.team_name AS team_name_1,
        t2.team_name AS team_name_2,
        tm1.score AS team_score_1,
        tm2.score AS team_score_2,
        tm1.home_away_team AS team1_status,
        tm2.home_away_team AS team2_status,
        m.match_date AS date
    FROM match_frisbee m
    JOIN team_match tm1 ON m.match_id = tm1.match_id
    JOIN team_match tm2 ON m.match_id = tm2.match_id AND tm1.team_id <> tm2.team_id
    JOIN team t1 ON tm1.team_id = t1.team_id
    JOIN team t2 ON tm2.team_id = t2.team_id
    WHERE tm1.home_away_team = 'home' 
        AND tm2.home_away_team = 'away' 
        AND m.match_id = p_match_id;
END$$

-- 7) Récupérer toutes les équipes
CREATE PROCEDURE get_all_teams()
BEGIN
    SELECT team_id AS id, team_name, logo FROM team;
END$$

-- 8) Récupérer une équipe par ID
CREATE PROCEDURE get_team_by_id(IN p_team_id INT)
BEGIN
    SELECT team_id AS id, team_name, logo 
    FROM team 
    WHERE team_id = p_team_id;
END$$

-- 9) Compter les joueurs d'une équipe
CREATE PROCEDURE get_team_player_count(IN p_team_id INT)
BEGIN
    SELECT COUNT(*) AS playerCount 
    FROM user_team 
    WHERE team_id = p_team_id;
END$$

-- 10) Login utilisateur
CREATE PROCEDURE get_user_by_email(IN p_email VARCHAR(100))
BEGIN
    SELECT email, password_hash 
    FROM users 
    WHERE email = p_email;
END$$

-- 11) Vérifier si un email existe
CREATE PROCEDURE check_email_exists(IN p_email VARCHAR(100))
BEGIN
    SELECT user_id 
    FROM users 
    WHERE email = p_email;
END$$

-- 12) Récupérer un utilisateur complet par email
CREATE PROCEDURE get_full_user_by_email(IN p_email VARCHAR(100))
BEGIN
    SELECT * 
    FROM users 
    WHERE email = p_email;
END$$


DELIMITER ;
