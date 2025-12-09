const request = require("supertest");
const express = require("express");
const matchesRouter = require("../routes/matches");
const pool = require("../pool");

// Mock dependencies
const request = require("supertest");
const express = require("express");
const matchesRouter = require("../routes/matches");
const pool = require("../pool");

// Mock dependencies
jest.mock("../pool", () => ({
  getConnection: jest.fn(),
}));

// Mock auth middleware
jest.mock("../middleware/auth", () => (req, res, next) => {
  req.user = { userId: 1, email: "test@example.com" };
  next();
});

const app = express();
app.use(express.json());
app.use("/api/matches", matchesRouter);

describe("Match Routes", () => {
  let mockConnection;

  beforeEach(() => {
    mockConnection = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.getConnection.mockResolvedValue(mockConnection);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // TESTS POUR GET /api/matches
  // ============================================

  describe("GET /api/matches", () => {
    it("should return all matches successfully", async () => {
      const mockMatches = [
        {
          id: 1,
          team_id_1: 10,
          team_id_2: 20,
          team_name_1: "EPHEC Ultimate",
          team_name_2: "LLN Wolf",
          team_score_1: 5,
          team_score_2: 3,
          team1_status: "home",
          team2_status: "away",
          date: "2025-11-04 20:00:00",
        },
        {
          id: 2,
          team_id_1: 30,
          team_id_2: 40,
          team_name_1: "Team A",
          team_name_2: "Team B",
          team_score_1: 13,
          team_score_2: 11,
          team1_status: "home",
          team2_status: "away",
          date: "2025-11-05 18:00:00",
        },
      ];

      mockConnection.query.mockResolvedValue([mockMatches]);

      const response = await request(app).get("/api/matches").expect(200);

      expect(response.body).toEqual(mockMatches);
      expect(mockConnection.query).toHaveBeenCalledWith(
        "CALL get_all_matches()",
        []
      );
    });

    it("should handle database error in GET /api/matches", async () => {
      mockConnection.query.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/matches").expect(500);

      expect(response.body).toEqual({ error: "db error" });
    });

    it("should return empty array when no matches exist", async () => {
      mockConnection.query.mockResolvedValue([[]]);

      const response = await request(app).get("/api/matches").expect(200);

      expect(response.body).toEqual([]);
    });
  });

  // ============================================
  // TESTS POUR GET /api/matches/user/:userId
  // ============================================

  describe("GET /api/matches/user/:userId", () => {
    it("should return matches for a specific user", async () => {
      const userId = 1;
      const mockUserMatches = [
        {
          id: 1,
          team_id_1: 10,
          team_id_2: 20,
          team_name_1: "EPHEC Ultimate",
          team_name_2: "LLN Wolf",
          team_score_1: 5,
          team_score_2: 3,
          team1_status: "home",
          team2_status: "away",
          date: "2025-11-04 20:00:00",
        },
      ];

      mockConnection.query.mockResolvedValue([mockUserMatches]);

      const response = await request(app)
        .get(`/api/matches/user/${userId}`)
        .expect(200);

      expect(response.body).toEqual(mockUserMatches);
      expect(mockConnection.query).toHaveBeenCalledWith(
        "CALL get_matches_by_user(?)",
        [userId]
      );
    });

    it("should return empty array when user has no matches", async () => {
      const userId = 999;
      mockConnection.query.mockResolvedValue([[]]);

      const response = await request(app)
        .get(`/api/matches/user/${userId}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it("should reject invalid userId (not a number)", async () => {
      const response = await request(app)
        .get("/api/matches/user/invalid")
        .expect(400);

      expect(response.body).toEqual({ error: "Invalid userId" });
    });

    it("should handle database error in GET /api/matches/user/:userId", async () => {
      const userId = 1;
      mockConnection.query.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get(`/api/matches/user/${userId}`)
        .expect(500);

      expect(response.body).toEqual({ error: "db error" });
    });

    it("should handle null rows response", async () => {
      const userId = 1;
      mockConnection.query.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/matches/user/${userId}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  // ============================================
  // TESTS POUR GET /api/matches/:id
  // ============================================

  describe("GET /api/matches/:id", () => {
    it("should return a specific match by id", async () => {
      const matchId = 1;
      const mockMatch = {
        id: matchId,
        team_id_1: 10,
        team_id_2: 20,
        team_name_1: "EPHEC Ultimate",
        team_name_2: "LLN Wolf",
        team_score_1: 5,
        team_score_2: 3,
        team1_status: "home",
        team2_status: "away",
        date: "2025-11-04 20:00:00",
      };

      mockConnection.query.mockResolvedValue([[mockMatch]]);

      const response = await request(app)
        .get(`/api/matches/${matchId}`)
        .expect(200);

      expect(response.body).toEqual(mockMatch);
      expect(mockConnection.query).toHaveBeenCalledWith(
        "CALL get_match_by_id(?)",
        [matchId.toString()]
      );
    });

    it("should return 404 when match not found", async () => {
      const matchId = 999;
      mockConnection.query.mockResolvedValue([[]]);

      const response = await request(app)
        .get(`/api/matches/${matchId}`)
        .expect(404);

      expect(response.body).toEqual({ error: "Match not found" });
    });

    it("should handle null rows response", async () => {
      const matchId = 1;
      mockConnection.query.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/matches/${matchId}`)
        .expect(404);

      expect(response.body).toEqual({ error: "Match not found" });
    });

    it("should handle database error in GET /api/matches/:id", async () => {
      const matchId = 1;
      mockConnection.query.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get(`/api/matches/${matchId}`)
        .expect(500);

      expect(response.body).toEqual({ error: "db error" });
    });
  });

  // ============================================
  // TESTS POUR L'ÉQUIPE 1 - INCRÉMENTATION
  // ============================================

  describe("Team 1 Score Increments (+1)", () => {
    const matchId = 1;
    const team1Id = 10;

    const mockMatch = {
      match_id: matchId,
      team_id_1: team1Id,
      team_id_2: 20,
      team_name_1: "EPHEC Ultimate",
      team_name_2: "LLN Wolf",
      team_score_1: 0,
      team_score_2: 0,
      team1_status: "home",
      team2_status: "away",
      date: "2025-11-04 20:00:00",
      status: "scheduled",
    };

    beforeEach(() => {
      mockConnection.query.mockImplementation((sql, params) => {
        if (sql.includes("get_match_by_id")) {
          return [[mockMatch]];
        }
        if (sql.includes("update_score")) {
          return [{ affectedRows: 1 }];
        }
        return [[]];
      });
    });

    it("should increment team 1 score from 0 to 1", async () => {
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 1 })
        .expect(200);

      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining("update_score"),
        [1, matchId, team1Id]
      );
    });

    it("should increment team 1 score from 1 to 2", async () => {
      mockMatch.team_score_1 = 1;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 2 })
        .expect(200);
    });

    it("should increment team 1 score from 2 to 3", async () => {
      mockMatch.team_score_1 = 2;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 3 })
        .expect(200);
    });

    it("should increment team 1 score from 3 to 4", async () => {
      mockMatch.team_score_1 = 3;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 4 })
        .expect(200);
    });

    it("should increment team 1 score from 4 to 5", async () => {
      mockMatch.team_score_1 = 4;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 5 })
        .expect(200);
    });

    it("should increment team 1 score from 5 to 6", async () => {
      mockMatch.team_score_1 = 5;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 6 })
        .expect(200);
    });

    it("should increment team 1 score from 6 to 7", async () => {
      mockMatch.team_score_1 = 6;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 7 })
        .expect(200);
    });

    it("should increment team 1 score from 7 to 8", async () => {
      mockMatch.team_score_1 = 7;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 8 })
        .expect(200);
    });

    it("should increment team 1 score from 8 to 9", async () => {
      mockMatch.team_score_1 = 8;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 9 })
        .expect(200);
    });

    it("should increment team 1 score from 9 to 10", async () => {
      mockMatch.team_score_1 = 9;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 10 })
        .expect(200);
    });

    it("should increment team 1 score from 10 to 11", async () => {
      mockMatch.team_score_1 = 10;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 11 })
        .expect(200);
    });

    it("should increment team 1 score from 11 to 12", async () => {
      mockMatch.team_score_1 = 11;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 12 })
        .expect(200);
    });

    it("should increment team 1 score from 12 to 13 (winning score)", async () => {
      mockMatch.team_score_1 = 12;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 13 })
        .expect(200);
    });
  });

  // ============================================
  // TESTS POUR L'ÉQUIPE 1 - DÉCRÉMENTATION
  // ============================================

  describe("Team 1 Score Decrements (-1)", () => {
    const matchId = 1;
    const team1Id = 10;

    const mockMatch = {
      match_id: matchId,
      team_id_1: team1Id,
      team_id_2: 20,
      team_name_1: "EPHEC Ultimate",
      team_name_2: "LLN Wolf",
      team_score_1: 5,
      team_score_2: 3,
      team1_status: "home",
      team2_status: "away",
      date: "2025-11-04 20:00:00",
      status: "scheduled",
    };

    beforeEach(() => {
      mockConnection.query.mockImplementation((sql, params) => {
        if (sql.includes("get_match_by_id")) {
          return [[mockMatch]];
        }
        if (sql.includes("update_score")) {
          return [{ affectedRows: 1 }];
        }
        return [[]];
      });
    });

    it("should decrement team 1 score from 13 to 12", async () => {
      mockMatch.team_score_1 = 13;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 12 })
        .expect(200);
    });

    it("should decrement team 1 score from 12 to 11", async () => {
      mockMatch.team_score_1 = 12;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 11 })
        .expect(200);
    });

    it("should decrement team 1 score from 5 to 4", async () => {
      mockMatch.team_score_1 = 5;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 4 })
        .expect(200);
    });

    it("should decrement team 1 score from 3 to 2", async () => {
      mockMatch.team_score_1 = 3;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 2 })
        .expect(200);
    });

    it("should decrement team 1 score from 2 to 1", async () => {
      mockMatch.team_score_1 = 2;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 1 })
        .expect(200);
    });

    it("should decrement team 1 score from 1 to 0", async () => {
      mockMatch.team_score_1 = 1;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 0 })
        .expect(200);
    });
  });

  // ============================================
  // TESTS POUR L'ÉQUIPE 2 - INCRÉMENTATION
  // ============================================

  describe("Team 2 Score Increments (+1)", () => {
    const matchId = 1;
    const team2Id = 20;

    const mockMatch = {
      match_id: matchId,
      team_id_1: 10,
      team_id_2: team2Id,
      team_name_1: "EPHEC Ultimate",
      team_name_2: "LLN Wolf",
      team_score_1: 0,
      team_score_2: 0,
      team1_status: "home",
      team2_status: "away",
      date: "2025-11-04 20:00:00",
      status: "scheduled",
    };

    beforeEach(() => {
      mockConnection.query.mockImplementation((sql, params) => {
        if (sql.includes("get_match_by_id")) {
          return [[mockMatch]];
        }
        if (sql.includes("update_score")) {
          return [{ affectedRows: 1 }];
        }
        return [[]];
      });
    });

    it("should increment team 2 score from 0 to 1", async () => {
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 1 })
        .expect(200);
    });

    it("should increment team 2 score from 1 to 2", async () => {
      mockMatch.team_score_2 = 1;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 2 })
        .expect(200);
    });

    it("should increment team 2 score from 2 to 3", async () => {
      mockMatch.team_score_2 = 2;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 3 })
        .expect(200);
    });

    it("should increment team 2 score from 3 to 4", async () => {
      mockMatch.team_score_2 = 3;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 4 })
        .expect(200);
    });

    it("should increment team 2 score from 4 to 5", async () => {
      mockMatch.team_score_2 = 4;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 5 })
        .expect(200);
    });

    it("should increment team 2 score from 5 to 6", async () => {
      mockMatch.team_score_2 = 5;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 6 })
        .expect(200);
    });

    it("should increment team 2 score from 6 to 7", async () => {
      mockMatch.team_score_2 = 6;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 7 })
        .expect(200);
    });

    it("should increment team 2 score from 7 to 8", async () => {
      mockMatch.team_score_2 = 7;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 8 })
        .expect(200);
    });

    it("should increment team 2 score from 8 to 9", async () => {
      mockMatch.team_score_2 = 8;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 9 })
        .expect(200);
    });

    it("should increment team 2 score from 9 to 10", async () => {
      mockMatch.team_score_2 = 9;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 10 })
        .expect(200);
    });

    it("should increment team 2 score from 10 to 11", async () => {
      mockMatch.team_score_2 = 10;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 11 })
        .expect(200);
    });

    it("should increment team 2 score from 11 to 12", async () => {
      mockMatch.team_score_2 = 11;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 12 })
        .expect(200);
    });

    it("should increment team 2 score from 12 to 13 (winning score)", async () => {
      mockMatch.team_score_2 = 12;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 13 })
        .expect(200);
    });
  });

  // ============================================
  // TESTS POUR L'ÉQUIPE 2 - DÉCRÉMENTATION
  // ============================================

  describe("Team 2 Score Decrements (-1)", () => {
    const matchId = 1;
    const team2Id = 20;

    const mockMatch = {
      match_id: matchId,
      team_id_1: 10,
      team_id_2: team2Id,
      team_name_1: "EPHEC Ultimate",
      team_name_2: "LLN Wolf",
      team_score_1: 3,
      team_score_2: 5,
      team1_status: "home",
      team2_status: "away",
      date: "2025-11-04 20:00:00",
      status: "scheduled",
    };

    beforeEach(() => {
      mockConnection.query.mockImplementation((sql, params) => {
        if (sql.includes("get_match_by_id")) {
          return [[mockMatch]];
        }
        if (sql.includes("update_score")) {
          return [{ affectedRows: 1 }];
        }
        return [[]];
      });
    });

    it("should decrement team 2 score from 13 to 12", async () => {
      mockMatch.team_score_2 = 13;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 12 })
        .expect(200);
    });

    it("should decrement team 2 score from 12 to 11", async () => {
      mockMatch.team_score_2 = 12;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 11 })
        .expect(200);
    });

    it("should decrement team 2 score from 5 to 4", async () => {
      mockMatch.team_score_2 = 5;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 4 })
        .expect(200);
    });

    it("should decrement team 2 score from 3 to 2", async () => {
      mockMatch.team_score_2 = 3;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 2 })
        .expect(200);
    });

    it("should decrement team 2 score from 2 to 1", async () => {
      mockMatch.team_score_2 = 2;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 1 })
        .expect(200);
    });

    it("should decrement team 2 score from 1 to 0", async () => {
      mockMatch.team_score_2 = 1;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 0 })
        .expect(200);
    });
  });

  // ============================================
  // TESTS DE VALIDATION ET ERREURS
  // ============================================

  describe("Score Update Validations and Error Cases", () => {
    const matchId = 1;
    const team1Id = 10;

    const mockMatch = {
      match_id: matchId,
      team_id_1: team1Id,
      team_id_2: 20,
      team_name_1: "EPHEC Ultimate",
      team_name_2: "LLN Wolf",
      team_score_1: 0,
      team_score_2: 0,
      team1_status: "home",
      team2_status: "away",
      date: "2025-11-04 20:00:00",
      status: "scheduled",
    };

    beforeEach(() => {
      mockConnection.query.mockImplementation((sql, params) => {
        if (sql.includes("get_match_by_id")) {
          return [[mockMatch]];
        }
        if (sql.includes("update_score")) {
          return [{ affectedRows: 1 }];
        }
        return [[]];
      });
    });

    it("should reject invalid match id (not a number)", async () => {
      await request(app)
        .put(`/api/matches/invalid/${team1Id}/score`)
        .send({ score: 1 })
        .expect(400);
    });

    it("should reject invalid team id (not a number)", async () => {
      await request(app)
        .put(`/api/matches/${matchId}/invalid/score`)
        .send({ score: 1 })
        .expect(400);
    });

    it("should reject missing score in request body", async () => {
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({})
        .expect(400);
    });

    it("should reject non-numeric score", async () => {
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: "invalid" })
        .expect(400);
    });

    it("should accept score of 0 (valid edge case)", async () => {
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 0 })
        .expect(200);
    });

    it("should reject score when match not found", async () => {
      mockConnection.query.mockResolvedValue([[]]);

      await request(app)
        .put(`/api/matches/999/${team1Id}/score`)
        .send({ score: 1 })
        .expect(404);
    });

    it("should reject score update for finished match", async () => {
      const finishedMatch = { ...mockMatch, status: "finished" };
      mockConnection.query.mockImplementation((sql, params) => {
        if (sql.includes("get_match_by_id")) {
          return [[finishedMatch]];
        }
        return [[]];
      });

      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 1 })
        .expect(403);
    });

    it("should handle database connection error gracefully", async () => {
      pool.getConnection.mockRejectedValue(new Error("Connection failed"));

      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 1 })
        .expect(500);
    });

    it("should handle update_score database error", async () => {
      mockConnection.query.mockImplementation((sql, params) => {
        if (sql.includes("get_match_by_id")) {
          return [[mockMatch]];
        }
        if (sql.includes("update_score")) {
          throw new Error("Update failed");
        }
        return [[]];
      });

      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 5 })
        .expect(500);
    });
  });

  // ============================================
  // TESTS SCÉNARIOS COMPLETS DE MATCH
  // ============================================

  describe("Complete Match Scenarios", () => {
    const matchId = 1;
    const team1Id = 10;
    const team2Id = 20;

    let currentMatch;

    beforeEach(() => {
      currentMatch = {
        match_id: matchId,
        team_id_1: team1Id,
        team_id_2: team2Id,
        team_name_1: "EPHEC Ultimate",
        team_name_2: "LLN Wolf",
        team_score_1: 0,
        team_score_2: 0,
        team1_status: "home",
        team2_status: "away",
        date: "2025-11-04 20:00:00",
        status: "scheduled",
      };

      mockConnection.query.mockImplementation((sql, params) => {
        if (sql.includes("get_match_by_id")) {
          return [[currentMatch]];
        }
        if (sql.includes("update_score")) {
          return [{ affectedRows: 1 }];
        }
        return [[]];
      });
    });

    it("should handle alternating score increments for both teams", async () => {
      // Team 1 scores: 0 → 1
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 1 })
        .expect(200);

      // Team 2 scores: 0 → 1
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 1 })
        .expect(200);

      expect(mockConnection.query).toHaveBeenCalledTimes(6);
    });

    it("should handle team 1 winning 13-11", async () => {
      currentMatch.team_score_1 = 12;
      currentMatch.team_score_2 = 11;

      // Team 1 scores final point: 12 → 13
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 13 })
        .expect(200);
    });

    it("should handle team 2 winning 13-10", async () => {
      currentMatch.team_score_1 = 10;
      currentMatch.team_score_2 = 12;

      // Team 2 scores final point: 12 → 13
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 13 })
        .expect(200);
    });

    it("should handle close game 13-12 for team 1", async () => {
      currentMatch.team_score_1 = 12;
      currentMatch.team_score_2 = 12;

      // Team 1 scores winning point: 12 → 13
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 13 })
        .expect(200);
    });

    it("should handle close game 13-12 for team 2", async () => {
      currentMatch.team_score_1 = 12;
      currentMatch.team_score_2 = 12;

      // Team 2 scores winning point: 12 → 13
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 13 })
        .expect(200);
    });

    it("should handle progressive score updates for team 1", async () => {
      // Simulate incremental scoring: 0 → 1 → 2 → 3
      currentMatch.team_score_1 = 0;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 1 })
        .expect(200);

      currentMatch.team_score_1 = 1;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 2 })
        .expect(200);

      currentMatch.team_score_1 = 2;
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 3 })
        .expect(200);
    });

    it("should handle progressive score updates for team 2", async () => {
      // Simulate incremental scoring: 0 → 1 → 2 → 3
      currentMatch.team_score_2 = 0;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 1 })
        .expect(200);

      currentMatch.team_score_2 = 1;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 2 })
        .expect(200);

      currentMatch.team_score_2 = 2;
      await request(app)
        .put(`/api/matches/${matchId}/${team2Id}/score`)
        .send({ score: 3 })
        .expect(200);
    });

    it("should handle score correction (decrement)", async () => {
      currentMatch.team_score_1 = 5;

      // Correct a mistake: 5 → 4
      await request(app)
        .put(`/api/matches/${matchId}/${team1Id}/score`)
        .send({ score: 4 })
        .expect(200);

      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining("update_score"),
        [4, matchId, team1Id]
      );
    });
  });
});
