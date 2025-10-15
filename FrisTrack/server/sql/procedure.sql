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

DELIMITER ;
