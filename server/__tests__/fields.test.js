const request = require("supertest");
const express = require("express");
const fieldsRouter = require("../routes/fields");
const pool = require("../pool");

// Mock dependencies
jest.mock("../pool", () => ({
  getConnection: jest.fn(),
}));

// Mock auth middleware (fields routes don't require auth currently, but mock anyway)
jest.mock("../middleware/auth", () => (req, res, next) => {
  req.user = { userId: 1, email: "test@example.com" };
  next();
});

const app = express();
app.use(express.json());
app.use("/api/fields", fieldsRouter);

describe("Fields Routes - Tests d'acceptation terrain", () => {
  let mockConnection;

  // Données de test pour un terrain
  const testFieldName = "Terrain Test EPHEC";
  const testCorners = {
    tl: { coords: { latitude: 50.8503, longitude: 4.3517 } },
    tr: { coords: { latitude: 50.8503, longitude: 4.3527 } },
    bl: { coords: { latitude: 50.8493, longitude: 4.3517 } },
    br: { coords: { latitude: 50.8493, longitude: 4.3527 } },
  };

  beforeEach(() => {
    mockConnection = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.getConnection.mockResolvedValue(mockConnection);
    jest.clearAllMocks();
  });

  // ============================================================
  // TEST 1 – Création de terrain
  // Définir 4 points GPS, donner un nom, sauvegarder.
  // Vérifier que le terrain apparaît dans la liste.
  // ============================================================
  describe("Test 1 – Création de terrain", () => {
    it("devrait créer un terrain avec 4 coins GPS et un nom", async () => {
      // Mock de l'insertion réussie
      mockConnection.query.mockResolvedValue({ insertId: 1, affectedRows: 1 });

      const response = await request(app)
        .post("/api/fields")
        .send({ name: testFieldName, corners: testCorners })
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("field_name", testFieldName);

      // Vérifier que la requête SQL a été appelée avec les bons paramètres
      expect(mockConnection.query).toHaveBeenCalledWith(
        "CALL add_field(?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          testFieldName,
          testCorners.tl.coords.longitude,
          testCorners.tl.coords.latitude,
          testCorners.tr.coords.longitude,
          testCorners.tr.coords.latitude,
          testCorners.bl.coords.longitude,
          testCorners.bl.coords.latitude,
          testCorners.br.coords.longitude,
          testCorners.br.coords.latitude,
        ]
      );
    });

    it("devrait retourner une erreur 400 si le nom est manquant", async () => {
      const response = await request(app)
        .post("/api/fields")
        .send({ corners: testCorners })
        .expect(400);

      expect(response.body).toEqual({ error: "Missing name or corners" });
    });

    it("devrait retourner une erreur 400 si les coins sont manquants", async () => {
      const response = await request(app)
        .post("/api/fields")
        .send({ name: testFieldName })
        .expect(400);

      expect(response.body).toEqual({ error: "Missing name or corners" });
    });

    it("devrait retourner une erreur 400 si un coin est manquant (ex: br)", async () => {
      const incompleteCorners = {
        tl: testCorners.tl,
        tr: testCorners.tr,
        bl: testCorners.bl,
        // br manquant
      };

      const response = await request(app)
        .post("/api/fields")
        .send({ name: testFieldName, corners: incompleteCorners })
        .expect(400);

      expect(response.body).toEqual({ error: "Missing name or corners" });
    });

    it("le terrain créé devrait apparaître dans la liste des terrains", async () => {
      // Mock de la réponse GET avec le terrain créé
      const mockFieldData = [
        {
          id: 1,
          field_name: testFieldName,
          created_at: new Date().toISOString(),
          tl_lat: testCorners.tl.coords.latitude,
          tl_lon: testCorners.tl.coords.longitude,
          tr_lat: testCorners.tr.coords.latitude,
          tr_lon: testCorners.tr.coords.longitude,
          bl_lat: testCorners.bl.coords.latitude,
          bl_lon: testCorners.bl.coords.longitude,
          br_lat: testCorners.br.coords.latitude,
          br_lon: testCorners.br.coords.longitude,
        },
      ];

      // MariaDB returns [[rows], fields] for CALL statements
      mockConnection.query.mockResolvedValue([mockFieldData, []]);

      const response = await request(app)
        .get("/api/fields")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const terrain = response.body.find((f) => f.name === testFieldName);
      expect(terrain).toBeDefined();
      expect(terrain.corners).toBeDefined();
      expect(terrain.corners.tl.coords.latitude).toBe(testCorners.tl.coords.latitude);
      expect(terrain.corners.tl.coords.longitude).toBe(testCorners.tl.coords.longitude);
    });
  });

  // ============================================================
  // TEST 2 – Suppression de terrain
  // Supprimer le terrain créé, vérifier qu'il disparaît de la liste.
  // ============================================================
  describe("Test 2 – Suppression de terrain", () => {
    it("devrait supprimer un terrain existant par son nom", async () => {
      // Mock de la suppression réussie
      mockConnection.query.mockResolvedValue([{ affectedRows: 1 }]);

      const response = await request(app)
        .delete(`/api/fields/${encodeURIComponent(testFieldName)}`)
        .expect(200);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain(testFieldName);
      expect(response.body.message).toContain("deleted");
    });

    it("devrait supprimer un terrain via la route /name/:name (compatibilité)", async () => {
      mockConnection.query.mockResolvedValue([{ affectedRows: 1 }]);

      const response = await request(app)
        .delete(`/api/fields/name/${encodeURIComponent(testFieldName)}`)
        .expect(200);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("deleted");
    });

    it("devrait retourner 404 si le terrain n'existe pas", async () => {
      // Mock de la suppression d'un terrain inexistant
      mockConnection.query.mockResolvedValue([{ affectedRows: 0 }]);

      const response = await request(app)
        .delete("/api/fields/TerrainInexistant")
        .expect(404);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("not found");
    });

    it("le terrain supprimé ne devrait plus apparaître dans la liste", async () => {
      // Mock de la liste vide après suppression
      mockConnection.query.mockResolvedValue([[], []]);

      const response = await request(app)
        .get("/api/fields")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      const terrain = response.body.find((f) => f.name === testFieldName);
      expect(terrain).toBeUndefined();
    });
  });

  // ============================================================
  // TEST 3 – Affichage du terrain
  // Charger un terrain et vérifier que les données sont correctes
  // pour un affichage rectangle avec les bonnes proportions.
  // ============================================================
  describe("Test 3 – Affichage du terrain (chargement et proportions)", () => {
    // Terrain de frisbee standard: 100m x 37m
    const fieldLength = 100; // mètres
    const fieldWidth = 37; // mètres
    const expectedAspectRatio = fieldLength / fieldWidth; // ~2.7

    it("devrait charger un terrain avec les 4 coins correctement formatés", async () => {
      const mockFieldData = [
        {
          id: 1,
          field_name: testFieldName,
          created_at: new Date().toISOString(),
          tl_lat: testCorners.tl.coords.latitude,
          tl_lon: testCorners.tl.coords.longitude,
          tr_lat: testCorners.tr.coords.latitude,
          tr_lon: testCorners.tr.coords.longitude,
          bl_lat: testCorners.bl.coords.latitude,
          bl_lon: testCorners.bl.coords.longitude,
          br_lat: testCorners.br.coords.latitude,
          br_lon: testCorners.br.coords.longitude,
        },
      ];

      mockConnection.query.mockResolvedValue([mockFieldData, []]);

      const response = await request(app)
        .get("/api/fields")
        .expect(200);

      const terrain = response.body[0];

      // Vérifier la structure des coins
      expect(terrain.corners).toHaveProperty("tl");
      expect(terrain.corners).toHaveProperty("tr");
      expect(terrain.corners).toHaveProperty("bl");
      expect(terrain.corners).toHaveProperty("br");

      // Vérifier que chaque coin a les coordonnées
      ["tl", "tr", "bl", "br"].forEach((corner) => {
        expect(terrain.corners[corner]).toHaveProperty("coords");
        expect(terrain.corners[corner].coords).toHaveProperty("latitude");
        expect(terrain.corners[corner].coords).toHaveProperty("longitude");
        expect(typeof terrain.corners[corner].coords.latitude).toBe("number");
        expect(typeof terrain.corners[corner].coords.longitude).toBe("number");
      });
    });

    it("les coordonnées du terrain devraient permettre un calcul de proportions correct", async () => {
      // Coordonnées simulant un terrain de 100m x 37m environ
      // À la latitude de Bruxelles (~50.85°), 1° longitude ≈ 71km, 1° latitude ≈ 111km
      // 100m ≈ 0.0009° latitude, 37m ≈ 0.00052° longitude (ajusté pour cos(lat))
      const latDelta = 0.0009; // ~100m
      const lonDelta = 0.00052; // ~37m à cette latitude

      const proportionalCorners = {
        tl: { coords: { latitude: 50.8503, longitude: 4.3517 } },
        tr: { coords: { latitude: 50.8503, longitude: 4.3517 + lonDelta } },
        bl: { coords: { latitude: 50.8503 - latDelta, longitude: 4.3517 } },
        br: { coords: { latitude: 50.8503 - latDelta, longitude: 4.3517 + lonDelta } },
      };

      const mockFieldData = [
        {
          id: 1,
          field_name: "Terrain Proportionnel",
          created_at: new Date().toISOString(),
          tl_lat: proportionalCorners.tl.coords.latitude,
          tl_lon: proportionalCorners.tl.coords.longitude,
          tr_lat: proportionalCorners.tr.coords.latitude,
          tr_lon: proportionalCorners.tr.coords.longitude,
          bl_lat: proportionalCorners.bl.coords.latitude,
          bl_lon: proportionalCorners.bl.coords.longitude,
          br_lat: proportionalCorners.br.coords.latitude,
          br_lon: proportionalCorners.br.coords.longitude,
        },
      ];

      mockConnection.query.mockResolvedValue([mockFieldData, []]);

      const response = await request(app)
        .get("/api/fields")
        .expect(200);

      const terrain = response.body[0];

      // Calculer les dimensions approximatives du terrain en degrés
      const widthDeg = Math.abs(
        terrain.corners.tr.coords.longitude - terrain.corners.tl.coords.longitude
      );
      const heightDeg = Math.abs(
        terrain.corners.tl.coords.latitude - terrain.corners.bl.coords.latitude
      );

      // Convertir en mètres (approximation)
      const lat = terrain.corners.tl.coords.latitude;
      const widthMeters = widthDeg * 111000 * Math.cos((lat * Math.PI) / 180);
      const heightMeters = heightDeg * 111000;

      // Vérifier que le ratio est proche de 100/37 (≈2.7)
      const calculatedRatio = heightMeters / widthMeters;
      
      // Tolérance de 20% pour les approximations GPS
      expect(calculatedRatio).toBeGreaterThan(expectedAspectRatio * 0.8);
      expect(calculatedRatio).toBeLessThan(expectedAspectRatio * 1.2);
    });

    it("devrait retourner les coordonnées comme des nombres (pas des strings)", async () => {
      const mockFieldData = [
        {
          id: 1,
          field_name: testFieldName,
          created_at: new Date().toISOString(),
          // Simuler des valeurs qui pourraient venir de la DB comme strings
          tl_lat: "50.8503",
          tl_lon: "4.3517",
          tr_lat: "50.8503",
          tr_lon: "4.3527",
          bl_lat: "50.8493",
          bl_lon: "4.3517",
          br_lat: "50.8493",
          br_lon: "4.3527",
        },
      ];

      mockConnection.query.mockResolvedValue([mockFieldData, []]);

      const response = await request(app)
        .get("/api/fields")
        .expect(200);

      const terrain = response.body[0];

      // Le service doit convertir en Number pour l'affichage correct
      expect(typeof terrain.corners.tl.coords.latitude).toBe("number");
      expect(typeof terrain.corners.tl.coords.longitude).toBe("number");
      expect(terrain.corners.tl.coords.latitude).toBe(50.8503);
      expect(terrain.corners.tl.coords.longitude).toBe(4.3517);
    });

    it("le terrain chargé devrait avoir toutes les propriétés nécessaires pour l'affichage", async () => {
      const mockFieldData = [
        {
          id: 42,
          field_name: "Terrain Complet",
          created_at: "2025-12-09T10:00:00.000Z",
          tl_lat: 50.8503,
          tl_lon: 4.3517,
          tr_lat: 50.8503,
          tr_lon: 4.3527,
          bl_lat: 50.8493,
          bl_lon: 4.3517,
          br_lat: 50.8493,
          br_lon: 4.3527,
        },
      ];

      mockConnection.query.mockResolvedValue([mockFieldData, []]);

      const response = await request(app)
        .get("/api/fields")
        .expect(200);

      const terrain = response.body[0];

      // Propriétés requises pour l'affichage
      expect(terrain).toHaveProperty("id", 42);
      expect(terrain).toHaveProperty("name", "Terrain Complet");
      expect(terrain).toHaveProperty("created_at");
      expect(terrain).toHaveProperty("corners");

      // Les 4 coins doivent être présents
      expect(Object.keys(terrain.corners)).toEqual(
        expect.arrayContaining(["tl", "tr", "bl", "br"])
      );
    });
  });

  // ============================================================
  // Tests supplémentaires - Gestion des erreurs
  // ============================================================
  describe("Gestion des erreurs", () => {
    it("devrait gérer les erreurs de base de données lors de la création", async () => {
      mockConnection.query.mockRejectedValue(new Error("DB connection failed"));

      const response = await request(app)
        .post("/api/fields")
        .send({ name: testFieldName, corners: testCorners })
        .expect(500);

      expect(response.body).toHaveProperty("error", "db error");
    });

    it("devrait gérer les erreurs de base de données lors de la récupération", async () => {
      mockConnection.query.mockRejectedValue(new Error("DB connection failed"));

      const response = await request(app)
        .get("/api/fields")
        .expect(500);

      expect(response.body).toHaveProperty("error", "db error");
    });

    it("devrait gérer les erreurs de base de données lors de la suppression", async () => {
      mockConnection.query.mockRejectedValue(new Error("DB connection failed"));

      const response = await request(app)
        .delete(`/api/fields/${testFieldName}`)
        .expect(500);

      expect(response.body).toHaveProperty("error", "db error");
    });
  });
});
