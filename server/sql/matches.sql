DELIMITER $$

-- Récupérer tous les matchs
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
    INNER JOIN team_match tm1 ON m.match_id = tm1.match_id
    INNER JOIN team_match tm2 ON m.match_id = tm2.match_id AND tm1.team_id <> tm2.team_id
    INNER JOIN team t1 ON tm1.team_id = t1.team_id
    INNER JOIN team t2 ON tm2.team_id = t2.team_id
    WHERE tm1.home_away_team = 'home' AND tm2.home_away_team = 'away';
END$$

-- Récupérer un match par ID
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
    INNER JOIN team_match tm1 ON m.match_id = tm1.match_id
    INNER JOIN team_match tm2 ON m.match_id = tm2.match_id AND tm1.team_id <> tm2.team_id
    INNER JOIN team t1 ON tm1.team_id = t1.team_id
    INNER JOIN team t2 ON tm2.team_id = t2.team_id
    WHERE tm1.home_away_team = 'home' 
        AND tm2.home_away_team = 'away' 
        AND m.match_id = p_match_id;
END$$

CREATE PROCEDURE get_matches_by_user(IN p_user_id INT)
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
    INNER JOIN team_match tm1 ON m.match_id = tm1.match_id
    INNER JOIN team_match tm2 ON m.match_id = tm2.match_id AND tm1.team_id <> tm2.team_id
    INNER JOIN team t1 ON tm1.team_id = t1.team_id
    INNER JOIN team t2 ON tm2.team_id = t2.team_id
    WHERE tm1.home_away_team = 'home'
      AND tm2.home_away_team = 'away'
      AND (
        tm1.team_id IN (SELECT team_id FROM user_team WHERE user_id = p_user_id)
        OR tm2.team_id IN (SELECT team_id FROM user_team WHERE user_id = p_user_id)
      );
END$$
DELIMITER ;