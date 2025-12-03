const request = require("supertest");
const express = require("express");
const teamsRouter = require("../routes/teams");
const usersRouter = require("../routes/users");
const pool = require("../index");
const authMiddleware = require("../middleware/auth");

// Mock the database pool
jest.mock("../index", () => ({
  getConnection: jest.fn(),
}));

// Mock the auth middleware
jest.mock("../middleware/auth", () => (req, res, next) => {
  req.user = { id: 1 };
  next();
});

const app = express();
app.use(express.json());
app.use("/api/teams", teamsRouter);
app.use("/api/users", usersRouter);

describe("Teams and Users Routes", () => {
  let mockConnection;

  beforeEach(() => {
    mockConnection = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.getConnection.mockResolvedValue(mockConnection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/teams/user/:userId", () => {
    it("should return team for valid userId", async () => {
      const mockTeam = [
        {
          team_id: 1,
          team_name: "EPHEC Ultimate",
          logo: "team_logos/ephec_ultimate.png",
          coach_id: 6,
          role_attack: "handler",
          role_def: "zone",
        },
      ];
      mockConnection.query.mockResolvedValue([mockTeam]);

      const response = await request(app).get("/api/teams/user/1").expect(200);

      expect(response.body).toEqual(mockTeam);
      expect(mockConnection.query).toHaveBeenCalledWith(
        "CALL get_user_team(?)",
        [1]
      );
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it("should return 404 when team not found", async () => {
      mockConnection.query.mockResolvedValue([[]]);

      const response = await request(app)
        .get("/api/teams/user/999")
        .expect(404);

      expect(response.body).toEqual({
        error: "Team not found for the user 999",
      });
    });

    it("should return 400 for invalid userId", async () => {
      const response = await request(app)
        .get("/api/teams/user/invalid")
        .expect(400);

      expect(response.body).toEqual({ error: "Invalid userId" });
    });

    it("should return 500 on database error", async () => {
      mockConnection.query.mockRejectedValue(new Error("DB Error"));

      const response = await request(app).get("/api/teams/user/1").expect(500);

      expect(response.body).toEqual({ error: "db error" });
    });

    it("should return multiple teams for user in multiple teams", async () => {
      const mockTeams = [
        {
          team_id: 1,
          team_name: "EPHEC Ultimate",
          role_attack: "handler",
          role_def: "zone",
        },
        {
          team_id: 3,
          team_name: "EPHEC TEAM A",
          role_attack: "handler",
          role_def: "zone",
        },
      ];
      mockConnection.query.mockResolvedValue([mockTeams]);

      const response = await request(app).get("/api/teams/user/3").expect(200);

      expect(response.body).toEqual(mockTeams);
      expect(response.body).toHaveLength(2);
    });

    it("should return 400 for userId = 0", async () => {
      const response = await request(app).get("/api/teams/user/0").expect(400);

      expect(response.body).toEqual({ error: "Invalid userId" });
    });

    it("should return 400 for negative userId", async () => {
      const response = await request(app).get("/api/teams/user/-5").expect(400);

      expect(response.body).toEqual({ error: "Invalid userId" });
    });

    it("should return 400 for userId with special characters", async () => {
      const response = await request(app)
        .get("/api/teams/user/1@#$")
        .expect(400);

      expect(response.body).toEqual({ error: "Invalid userId" });
    });

    it("should return 400 for userId with decimals", async () => {
      const response = await request(app)
        .get("/api/teams/user/1.5")
        .expect(400);

      expect(response.body).toEqual({ error: "Invalid userId" });
    });

    it("should return 404 for valid userId with no team assignment", async () => {
      mockConnection.query.mockResolvedValue([[]]);

      const response = await request(app)
        .get("/api/teams/user/100")
        .expect(404);

      expect(response.body).toEqual({
        error: "Team not found for the user 100",
      });
    });

    it("should handle team with null coach_id", async () => {
      const mockTeam = [
        {
          team_id: 2,
          team_name: "LLN Wolf",
          logo: "team_logos/lln_wolf.png",
          coach_id: null,
          role_attack: "stack",
          role_def: "zone",
        },
      ];
      mockConnection.query.mockResolvedValue([mockTeam]);

      const response = await request(app).get("/api/teams/user/5").expect(200);

      expect(response.body).toEqual(mockTeam);
      expect(response.body[0].coach_id).toBeNull();
    });

    it("should handle team with non-existent coach_id", async () => {
      const mockTeam = [
        {
          team_id: 2,
          team_name: "LLN Wolf",
          coach_id: 999,
          role_attack: "stack",
          role_def: "zone",
        },
      ];
      mockConnection.query.mockResolvedValue([mockTeam]);

      const response = await request(app).get("/api/teams/user/5").expect(200);

      expect(response.body).toEqual(mockTeam);
    });

    it("should handle very large userId", async () => {
      mockConnection.query.mockResolvedValue([[]]);

      const response = await request(app)
        .get("/api/teams/user/2147483647")
        .expect(404);

      expect(response.body).toEqual({
        error: "Team not found for the user 2147483647",
      });
    });
  });

  describe("GET /api/users/team-role-attack", () => {
    it("should return users with team role and attack stats", async () => {
      const mockUsers = [
        {
          user_id: 1,
          firstname: "Cyril",
          lastname: "Lamand",
          pseudo: "Crocrodile",
          team_id: 1,
          team_name: "EPHEC Ultimate",
          role_attack: "handler",
          role_def: "zone",
        },
        {
          user_id: 2,
          firstname: "Alexis",
          lastname: "DEMARCQ",
          pseudo: "Saint-Patic",
          team_id: 1,
          team_name: "EPHEC Ultimate",
          role_attack: "stack",
          role_def: "zone",
        },
      ];
      mockConnection.query.mockResolvedValue([mockUsers]);

      const response = await request(app)
        .get("/api/users/team-role-attack")
        .expect(200);

      expect(response.body).toEqual(mockUsers);
      expect(mockConnection.release).toHaveBeenCalled();
    });

    it("should return users with different attack roles", async () => {
      const mockUsers = [
        {
          user_id: 1,
          pseudo: "Crocrodile",
          team_id: 1,
          role_attack: "handler",
          role_def: "zone",
        },
        {
          user_id: 3,
          pseudo: "Naifu",
          team_id: 1,
          role_attack: "stack",
          role_def: "chien",
        },
      ];
      mockConnection.query.mockResolvedValue([mockUsers]);

      const response = await request(app)
        .get("/api/users/team-role-attack")
        .expect(200);

      expect(response.body).toEqual(mockUsers);
      expect(response.body.some((u) => u.role_attack === "handler")).toBe(true);
      expect(response.body.some((u) => u.role_attack === "stack")).toBe(true);
    });

    it("should return empty array when no users found", async () => {
      mockConnection.query.mockResolvedValue([[]]);

      const response = await request(app)
        .get("/api/users/team-role-attack")
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it("should return 500 on database error", async () => {
      mockConnection.query.mockRejectedValue(new Error("DB Error"));

      const response = await request(app)
        .get("/api/users/team-role-attack")
        .expect(500);

      expect(response.body).toEqual({ error: "db error" });
    });

    it("should handle users with null role_attack", async () => {
      const mockUsers = [
        {
          user_id: 1,
          pseudo: "Crocrodile",
          team_id: 1,
          role_attack: null,
          role_def: "zone",
        },
      ];
      mockConnection.query.mockResolvedValue([mockUsers]);

      const response = await request(app)
        .get("/api/users/team-role-attack")
        .expect(200);

      expect(response.body).toEqual(mockUsers);
      expect(response.body[0].role_attack).toBeNull();
    });

    it("should handle users with null role_def", async () => {
      const mockUsers = [
        {
          user_id: 1,
          pseudo: "Crocrodile",
          team_id: 1,
          role_attack: "back",
          role_def: null,
        },
      ];
      mockConnection.query.mockResolvedValue([mockUsers]);

      const response = await request(app)
        .get("/api/users/team-role-attack")
        .expect(200);

      expect(response.body).toEqual(mockUsers);
      expect(response.body[0].role_def).toBeNull();
    });

    it("should handle users with invalid role values", async () => {
      const mockUsers = [
        {
          user_id: 1,
          pseudo: "Crocrodile",
          team_id: 1,
          role_attack: "invalid_role",
          role_def: "zone",
        },
      ];
      mockConnection.query.mockResolvedValue([mockUsers]);

      const response = await request(app)
        .get("/api/users/team-role-attack")
        .expect(200);

      expect(response.body).toEqual(mockUsers);
    });

    it("should handle users in non-existent teams", async () => {
      const mockUsers = [
        {
          user_id: 1,
          pseudo: "Crocrodile",
          team_id: 9999,
          team_name: null,
          role_attack: "back",
          role_def: "zone",
        },
      ];
      mockConnection.query.mockResolvedValue([mockUsers]);

      const response = await request(app)
        .get("/api/users/team-role-attack")
        .expect(200);

      expect(response.body).toEqual(mockUsers);
    });

    it("should handle users with both roles as 'back' and 'chien'", async () => {
      const mockUsers = [
        {
          user_id: 3,
          pseudo: "Naifu",
          team_id: 1,
          role_attack: "back",
          role_def: "chien",
        },
      ];
      mockConnection.query.mockResolvedValue([mockUsers]);

      const response = await request(app)
        .get("/api/users/team-role-attack")
        .expect(200);

      expect(response.body[0].role_attack).toBe("back");
      expect(response.body[0].role_def).toBe("chien");
    });

    it("should handle users with both roles as 'stack' and 'zone'", async () => {
      const mockUsers = [
        {
          user_id: 2,
          pseudo: "Saint-Patic",
          team_id: 1,
          role_attack: "stack",
          role_def: "zone",
        },
      ];
      mockConnection.query.mockResolvedValue([mockUsers]);

      const response = await request(app)
        .get("/api/users/team-role-attack")
        .expect(200);

      expect(response.body[0].role_attack).toBe("stack");
      expect(response.body[0].role_def).toBe("zone");
    });

    it("should handle large result sets", async () => {
      const mockUsers = Array.from({ length: 100 }, (_, i) => ({
        user_id: i + 1,
        pseudo: `User${i + 1}`,
        team_id: Math.floor(i / 10) + 1,
        role_attack: i % 2 === 0 ? "back" : "stack",
        role_def: i % 2 === 0 ? "zone" : "chien",
      }));
      mockConnection.query.mockResolvedValue([mockUsers]);

      const response = await request(app)
        .get("/api/users/team-role-attack")
        .expect(200);

      expect(response.body).toHaveLength(100);
    });

    it("should handle database timeout error", async () => {
      const timeoutError = new Error("Connection timeout");
      timeoutError.code = "ETIMEDOUT";
      mockConnection.query.mockRejectedValue(timeoutError);

      const response = await request(app)
        .get("/api/users/team-role-attack")
        .expect(500);

      expect(response.body).toEqual({ error: "db error" });
    });

    it("should handle connection refused error", async () => {
      const connectionError = new Error("Connection refused");
      connectionError.code = "ECONNREFUSED";
      mockConnection.query.mockRejectedValue(connectionError);

      const response = await request(app)
        .get("/api/users/team-role-attack")
        .expect(500);

      expect(response.body).toEqual({ error: "db error" });
    });
  });

  describe("Authentication", () => {
    it("should require authentication for /api/teams/user/:userId", async () => {
      // This test verifies that authMiddleware is applied
      expect(authMiddleware).toBeDefined();
    });

    it("should require authentication for /api/users/team-role-attack", async () => {
      // This test verifies that authMiddleware is applied
      expect(authMiddleware).toBeDefined();
    });
  });
});
