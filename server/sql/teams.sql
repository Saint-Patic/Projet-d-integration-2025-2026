DELIMITER $$

-- Récupérer toutes les équipes
CREATE PROCEDURE get_all_teams()
BEGIN
    SELECT team_id AS id, team_name, logo FROM team;
END$$

-- Récupérer les équipes d'un coach
CREATE PROCEDURE get_coach_team(IN p_user_id INT)
BEGIN
    SELECT team_id AS id, team_name, logo FROM team
    where coach_id = p_user_id;
END$$

-- Récupérer une équipe par ID
CREATE PROCEDURE get_team_by_id(IN p_team_id INT)
BEGIN
    SELECT team_id AS id, team_name, logo 
    FROM team 
    WHERE team_id = p_team_id;
END$$

-- Compter les joueurs d'une équipe
CREATE PROCEDURE get_team_player_count(IN p_team_id INT)
BEGIN
    SELECT COUNT(*) AS playerCount 
    FROM user_team 
    WHERE team_id = p_team_id;
END$$

-- récupérer les joueurs d'une équipe donnée 
CREATE PROCEDURE getPlayerTeam(IN p_team_id INT)
BEGIN  
    SELECT 
        t.team_id,
        t.team_name,
        u.user_id,
        CONCAT(u.firstname, ' ', u.lastname) AS player_name,
        ut.role_attack,
        u.profile_picture
    FROM team t
    LEFT JOIN user_team ut ON t.team_id = ut.team_id
    LEFT JOIN users u ON ut.user_id = u.user_id
    WHERE t.team_id = p_team_id
    ORDER BY u.lastname, u.firstname;
END$$

CREATE PROCEDURE get_user_team(IN p_user INT)
BEGIN
    SELECT 
        t.team_id AS id, 
        t.team_name, 
        t.logo 
    FROM team t 
    JOIN user_team ut ON t.team_id = ut.team_id
    WHERE ut.user_id = p_user;
END$$

DELIMITER ;