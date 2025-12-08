const request = require("supertest");
const express = require("express");
const usersRouter = require("../routes/users");
const pool = require("../pool");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

// Mock dependencies
jest.mock("../pool", () => ({
  getConnection: jest.fn(),
}));

jest.mock("argon2");
jest.mock("jsonwebtoken");

// Mock auth middleware
jest.mock("../middleware/auth", () => (req, res, next) => {
  req.user = { userId: 1, email: "test@example.com" };
  next();
});

// Mock rate limiters
jest.mock("../middleware/rateLimiter", () => ({
  loginLimiter: (req, res, next) => next(),
  generalLimiter: (req, res, next) => next(),
  updateLimiter: (req, res, next) => next(),
}));

const app = express();
app.use(express.json());
app.use("/api/users", usersRouter);

describe("Users Routes", () => {
  let mockConnection;

  beforeEach(() => {
    mockConnection = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.getConnection.mockResolvedValue(mockConnection);
    jest.clearAllMocks();
  });

  describe("POST /api/users/login", () => {
    it("should login successfully with valid credentials", async () => {
      const mockUser = {
        user_id: 1,
        firstname: "John",
        lastname: "Doe",
        pseudo: "johndoe",
        email: "john@example.com",
        password_hash: "hashed_password",
        birthdate: new Date("1990-01-01"),
        created_at: new Date(),
      };

      mockConnection.query.mockResolvedValue([mockUser]);
      argon2.verify.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mock_token");

      const response = await request(app)
        .post("/api/users/login")
        .send({ email: "john@example.com", password: "ValidPassword123!" })
        .expect(200);

      expect(response.body).toHaveProperty("success", true);
      expect(response.body).toHaveProperty("token", "mock_token");
      expect(response.body.user).not.toHaveProperty("password_hash");
    });

    it("should return 400 if email or password is missing", async () => {
      const response = await request(app)
        .post("/api/users/login")
        .send({ email: "test@example.com" })
        .expect(400);

      expect(response.body).toEqual({ error: "Email et mot de passe requis" });
    });

    it("should return 400 for invalid email format", async () => {
      const response = await request(app)
        .post("/api/users/login")
        .send({ email: "invalid-email", password: "password" })
        .expect(400);

      expect(response.body).toEqual({ error: "Format d'email invalide" });
    });

    it("should return 400 for empty password", async () => {
      const response = await request(app)
        .post("/api/users/login")
        .send({ email: "test@example.com", password: "" })
        .expect(400);

      expect(response.body).toEqual({ error: "Email et mot de passe requis" });
    });

    it("should return 401 if user not found", async () => {
      mockConnection.query.mockResolvedValue([]);

      const response = await request(app)
        .post("/api/users/login")
        .send({ email: "nonexistent@example.com", password: "password" })
        .expect(401);

      expect(response.body).toEqual({
        error: "Échec de la connexion, identifiant utilisateur invalide.",
      });
    });

    it("should return 401 for invalid password", async () => {
      const mockUser = {
        user_id: 1,
        email: "john@example.com",
        password_hash: "hashed_password",
      };

      mockConnection.query.mockResolvedValue([mockUser]);
      argon2.verify.mockResolvedValue(false);

      const response = await request(app)
        .post("/api/users/login")
        .send({ email: "john@example.com", password: "WrongPassword123!" })
        .expect(401);

      expect(response.body).toEqual({
        error: "Connexion pour l'utilisateur fail : mot de passe invalide.",
      });
    });

    it("should return 500 on database error", async () => {
      mockConnection.query.mockRejectedValue(new Error("DB Error"));

      const response = await request(app)
        .post("/api/users/login")
        .send({ email: "test@example.com", password: "password" })
        .expect(500);

      expect(response.body).toEqual({
        error: "Erreur serveur lors de la connexion",
      });
    });
  });

  describe("GET /api/users/check-pseudo/:pseudo", () => {
    it("should return available true if pseudo is available", async () => {
      mockConnection.query.mockResolvedValue([[]]);

      const response = await request(app)
        .get("/api/users/check-pseudo/newpseudo")
        .expect(200);

      expect(response.body).toEqual({ available: true });
    });

    it("should return available false if pseudo is taken", async () => {
      mockConnection.query.mockResolvedValue([[{ pseudo: "existingpseudo" }]]);

      const response = await request(app)
        .get("/api/users/check-pseudo/existingpseudo")
        .expect(200);

      expect(response.body).toEqual({ available: false });
    });

    it("should return 400 for invalid pseudo format", async () => {
      const response = await request(app)
        .get("/api/users/check-pseudo/ab")
        .expect(400);

      expect(response.body).toHaveProperty(
        "error",
        "Format de pseudo invalide"
      );
      expect(response.body).toHaveProperty("available", false);
    });

    it("should return 500 on database error", async () => {
      mockConnection.query.mockRejectedValue(new Error("DB Error"));

      const response = await request(app)
        .get("/api/users/check-pseudo/testpseudo")
        .expect(500);

      expect(response.body).toEqual({ error: "Erreur serveur" });
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return user info for valid ID", async () => {
      const mockUser = {
        user_id: 1,
        firstname: "John",
        lastname: "Doe",
        pseudo: "johndoe",
        birthdate: new Date("1990-01-01"),
        created_at: new Date(),
      };

      mockConnection.query.mockResolvedValue([[mockUser]]);

      const response = await request(app).get("/api/users/1").expect(200);

      expect(response.body).toHaveProperty("user_id", 1);
      expect(response.body).toHaveProperty("pseudo", "johndoe");
    });

    it("should return null if user not found", async () => {
      mockConnection.query.mockResolvedValue([[]]);

      const response = await request(app).get("/api/users/999").expect(200);

      expect(response.body).toBeNull();
    });

    it("should return 400 for invalid ID", async () => {
      const response = await request(app).get("/api/users/invalid").expect(400);

      expect(response.body).toEqual({ error: "ID invalide" });
    });

    it("should return 500 on database error", async () => {
      mockConnection.query.mockRejectedValue(new Error("DB Error"));

      const response = await request(app).get("/api/users/1").expect(500);

      expect(response.body).toEqual({ error: "db error" });
    });
  });

  describe("PUT /api/users/basic", () => {
    it("should update user basic info successfully", async () => {
      mockConnection.query.mockResolvedValue([{ affectedRows: 1 }]);

      const response = await request(app)
        .put("/api/users/basic")
        .send({
          user_id: 1,
          firstname: "John",
          lastname: "Doe",
          pseudo: "johndoe",
          birthdate: "1990-01-01",
          email: "john@example.com",
        })
        .expect(200);

      expect(response.body).toEqual({ success: true });
    });

    it("should return 400 for invalid user_id", async () => {
      const response = await request(app)
        .put("/api/users/basic")
        .send({
          user_id: "invalid",
          firstname: "John",
        })
        .expect(400);

      expect(response.body).toEqual({ error: "user_id invalide" });
    });

    it("should return 403 if user tries to modify another user", async () => {
      const response = await request(app)
        .put("/api/users/basic")
        .send({
          user_id: 999,
          firstname: "John",
        })
        .expect(403);

      expect(response.body).toEqual({
        error: "Non autorisé à modifier cet utilisateur",
      });
    });

    it("should return 400 for invalid firstname", async () => {
      const response = await request(app)
        .put("/api/users/basic")
        .send({
          user_id: 1,
          firstname: "A",
        })
        .expect(400);

      expect(response.body).toEqual({ error: "Prénom invalide" });
    });

    it("should return 400 for invalid lastname", async () => {
      const response = await request(app)
        .put("/api/users/basic")
        .send({
          user_id: 1,
          lastname: "B",
        })
        .expect(400);

      expect(response.body).toEqual({ error: "Nom invalide" });
    });

    it("should return 400 for invalid pseudo", async () => {
      const response = await request(app)
        .put("/api/users/basic")
        .send({
          user_id: 1,
          pseudo: "ab",
        })
        .expect(400);

      expect(response.body).toEqual({ error: "Pseudo invalide" });
    });

    it("should return 400 for invalid birthdate", async () => {
      const response = await request(app)
        .put("/api/users/basic")
        .send({
          user_id: 1,
          birthdate: "invalid-date",
        })
        .expect(400);

      expect(response.body).toEqual({ error: "Date de naissance invalide" });
    });

    it("should return 400 for invalid email", async () => {
      const response = await request(app)
        .put("/api/users/basic")
        .send({
          user_id: 1,
          email: "invalid-email",
        })
        .expect(400);

      expect(response.body).toEqual({ error: "Email invalide" });
    });

    it("should return 409 for duplicate email or pseudo", async () => {
      const duplicateError = new Error("Duplicate entry");
      duplicateError.code = "ER_DUP_ENTRY";
      mockConnection.query.mockRejectedValue(duplicateError);

      const response = await request(app)
        .put("/api/users/basic")
        .send({
          user_id: 1,
          email: "existing@example.com",
        })
        .expect(409);

      expect(response.body).toEqual({ error: "Email ou pseudo déjà utilisé" });
    });
  });

  describe("PUT /api/users/password", () => {
    it("should update password successfully", async () => {
      argon2.hash.mockResolvedValue("new_hashed_password");
      mockConnection.query.mockResolvedValue([{ affectedRows: 1 }]);

      const response = await request(app)
        .put("/api/users/password")
        .send({
          user_id: 1,
          password: "NewPassword123!",
        })
        .expect(200);

      expect(response.body).toEqual({ success: true });
      expect(argon2.hash).toHaveBeenCalledWith("NewPassword123!");
    });

    it("should return 400 for invalid user_id", async () => {
      const response = await request(app)
        .put("/api/users/password")
        .send({
          user_id: "invalid",
          password: "NewPassword123!",
        })
        .expect(400);

      expect(response.body).toEqual({ error: "user_id invalide" });
    });

    it("should return 403 for unauthorized user", async () => {
      const response = await request(app)
        .put("/api/users/password")
        .send({
          user_id: 999,
          password: "NewPassword123!",
        })
        .expect(403);

      expect(response.body).toEqual({ error: "Non autorisé" });
    });

    it("should return 400 for invalid password format", async () => {
      const response = await request(app)
        .put("/api/users/password")
        .send({
          user_id: 1,
          password: "weak",
        })
        .expect(400);

      expect(response.body.error).toContain("mot de passe doit contenir");
    });
  });

  describe("PUT /api/users/profile", () => {
    it("should update profile successfully", async () => {
      mockConnection.query.mockResolvedValue([{ affectedRows: 1 }]);

      const response = await request(app)
        .put("/api/users/profile")
        .send({
          user_id: 1,
          user_weight: 70,
          user_height: 175,
          foot_size: 42,
          dominant_hand: "right",
          pseudo: "newpseudo",
          profile_picture: "avatar.jpg",
        })
        .expect(200);

      expect(response.body).toEqual({ success: true });
    });

    it("should return 400 for invalid weight", async () => {
      const response = await request(app)
        .put("/api/users/profile")
        .send({
          user_id: 1,
          user_weight: 5,
        })
        .expect(400);

      expect(response.body).toEqual({ error: "Poids invalide (10-300 kg)" });
    });

    it("should return 400 for invalid height", async () => {
      const response = await request(app)
        .put("/api/users/profile")
        .send({
          user_id: 1,
          user_height: 30,
        })
        .expect(400);

      expect(response.body).toEqual({ error: "Taille invalide (50-250 cm)" });
    });

    it("should return 400 for invalid foot size", async () => {
      const response = await request(app)
        .put("/api/users/profile")
        .send({
          user_id: 1,
          foot_size: 10,
        })
        .expect(400);

      expect(response.body).toEqual({ error: "Pointure invalide (15-65)" });
    });

    it("should return 400 for invalid dominant hand", async () => {
      const response = await request(app)
        .put("/api/users/profile")
        .send({
          user_id: 1,
          dominant_hand: "invalid",
        })
        .expect(400);

      expect(response.body).toEqual({ error: "Main dominante invalide" });
    });

    it("should return 409 for duplicate pseudo", async () => {
      const duplicateError = new Error("Duplicate entry");
      duplicateError.code = "ER_DUP_ENTRY";
      mockConnection.query.mockRejectedValue(duplicateError);

      const response = await request(app)
        .put("/api/users/profile")
        .send({
          user_id: 1,
          pseudo: "existingpseudo",
        })
        .expect(409);

      expect(response.body).toEqual({ error: "Pseudo déjà utilisé" });
    });
  });

  describe("PUT /api/users/type", () => {
    it("should update user type successfully", async () => {
      mockConnection.query.mockResolvedValue([{ affectedRows: 1 }]);

      const response = await request(app)
        .put("/api/users/type")
        .send({
          user_id: 1,
          user_type: "both",
        })
        .expect(200);

      expect(response.body).toEqual({ success: true });
    });

    it("should return 400 for invalid user_type", async () => {
      const response = await request(app)
        .put("/api/users/type")
        .send({
          user_id: 1,
          user_type: "invalid",
        })
        .expect(400);

      expect(response.body).toEqual({ error: "user_type invalide" });
    });

    it("should return 403 for unauthorized user", async () => {
      const response = await request(app)
        .put("/api/users/type")
        .send({
          user_id: 999,
          user_type: "both",
        })
        .expect(403);

      expect(response.body).toEqual({ error: "Non autorisé" });
    });
  });

  describe("PUT /api/users/team-role-attack", () => {
    it("should update team role attack successfully", async () => {
      mockConnection.query
        .mockResolvedValueOnce([[{ user_id: 1, user_type: "playeronly" }]])
        .mockResolvedValueOnce({ affectedRows: 1 });

      const response = await request(app)
        .put("/api/users/team-role-attack")
        .send({
          user_id: 1,
          team_id: 1,
          role_attack: "handler",
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: "Rôle d'attaque mis à jour avec succès",
      });
    });

    it("should return 400 for invalid IDs", async () => {
      const response = await request(app)
        .put("/api/users/team-role-attack")
        .send({
          user_id: "invalid",
          team_id: 1,
          role_attack: "handler",
        })
        .expect(400);

      expect(response.body).toEqual({ error: "IDs invalides" });
    });

    it("should return 400 for invalid role_attack", async () => {
      const response = await request(app)
        .put("/api/users/team-role-attack")
        .send({
          user_id: 1,
          team_id: 1,
          role_attack: "invalid",
        })
        .expect(400);

      expect(response.body).toEqual({
        error: "role_attack doit être 'handler' ou 'stack'",
      });
    });

    it("should return 403 if user is not a team member", async () => {
      mockConnection.query.mockResolvedValueOnce([[]]);

      const response = await request(app)
        .put("/api/users/team-role-attack")
        .send({
          user_id: 1,
          team_id: 1,
          role_attack: "handler",
        })
        .expect(403);

      expect(response.body).toEqual({
        error: "Non autorisé à modifier cette équipe",
      });
    });

    it("should return 404 if no association found", async () => {
      mockConnection.query
        .mockResolvedValueOnce([[{ user_id: 1, user_type: "playeronly" }]])
        .mockResolvedValueOnce({ affectedRows: 0 });

      const response = await request(app)
        .put("/api/users/team-role-attack")
        .send({
          user_id: 1,
          team_id: 1,
          role_attack: "handler",
        })
        .expect(404);

      expect(response.body).toEqual({
        error:
          "Aucune association trouvée pour cet utilisateur et cette équipe",
      });
    });

    it("should return 500 on database error", async () => {
      mockConnection.query.mockRejectedValue(new Error("DB Error"));

      const response = await request(app)
        .put("/api/users/team-role-attack")
        .send({
          user_id: 1,
          team_id: 1,
          role_attack: "handler",
        })
        .expect(500);

      expect(response.body).toEqual({
        error: "Erreur serveur lors de la mise à jour",
      });
    });
  });
});
