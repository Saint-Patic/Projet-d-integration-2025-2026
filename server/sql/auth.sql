DELIMITER $$

-- Login utilisateur (récupère email + password_hash)
CREATE PROCEDURE get_user_by_email(IN p_email VARCHAR(100))
BEGIN
    SELECT email, password_hash 
    FROM users 
    WHERE email = p_email;
END$$

-- Vérifier si un email existe
CREATE PROCEDURE check_email_exists(IN p_email VARCHAR(100))
BEGIN
    SELECT user_id 
    FROM users 
    WHERE email = p_email;
END$$

-- Vérifier si un email existe déjà (pour l'inscription)
CREATE PROCEDURE check_email_for_registration(IN p_email VARCHAR(100))
BEGIN
    SELECT user_id 
    FROM users 
    WHERE email = p_email;
END$$

-- Vérifier la disponibilité d'un pseudo
CREATE PROCEDURE check_pseudo_available(IN p_pseudo VARCHAR(50))
BEGIN
    SELECT user_id 
    FROM users 
    WHERE pseudo = p_pseudo;
END$$

DELIMITER ;