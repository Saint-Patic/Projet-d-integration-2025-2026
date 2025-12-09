/**
 * Tests d'intégration pour les routes Fields
 * Ces tests interagissent avec la vraie base de données
 * 
 * ⚠️ ATTENTION: Ces tests modifient la base de données !
 * Ils créent et suppriment des terrains de test.
 */

const request = require("supertest");
const express = require("express");
const fieldsRouter = require("../routes/fields");
const pool = require("../pool");

// Charger les variables d'environnement
require("dotenv").config();

const app = express();
app.use(express.json());
app.use("/api/fields", fieldsRouter);

// Nom unique pour éviter les conflits avec des terrains existants
const TEST_FIELD_NAME = `TEST_TERRAIN_${Date.now()}`;

// Données de test - coordonnées GPS fictives mais valides
const testCorners = {
  tl: { coords: { latitude: 50.8503, longitude: 4.3517 } },
  tr: { coords: { latitude: 50.8503, longitude: 4.3527 } },
  bl: { coords: { latitude: 50.8493, longitude: 4.3517 } },
  br: { coords: { latitude: 50.8493, longitude: 4.3527 } },
};

describe("Tests d'intégration Fields - Base de données réelle", () => {
  
  // Variable pour stocker l'ID du terrain créé
  let createdFieldId = null;

  // Vérifier la connexion à la DB avant les tests
  beforeAll(async () => {
    try {
      const conn = await pool.getConnection();
      console.log("✅ Connexion à la base de données établie");
      conn.release();
    } catch (err) {
      console.error("❌ Impossible de se connecter à la base de données:", err.message);
      throw new Error("Les tests d'intégration nécessitent une connexion à la base de données");
    }
  });

  // Nettoyer après tous les tests (au cas où un test échoue)
  afterAll(async () => {
    // COMMENTÉ: Ne pas supprimer pour pouvoir vérifier en DB
    // try {
    //   // Supprimer le terrain de test s'il existe encore
    //   const conn = await pool.getConnection();
    //   await conn.query("CALL delete_field(?)", [TEST_FIELD_NAME]);
    //   conn.release();
    // } catch (err) {
    //   // Ignorer les erreurs de suppression (terrain peut ne pas exister)
    // }
    
    // Fermer le pool de connexions
    await pool.end();
  });

  // ============================================================
  // TEST 1 – Création de terrain
  // Définir 4 points GPS, donner un nom, sauvegarder.
  // Vérifier que le terrain apparaît dans la liste.
  // ============================================================
  describe("Test 1 – Création de terrain (DB réelle)", () => {
    
    it("devrait créer un terrain avec 4 coins GPS et un nom dans la DB", async () => {
      const response = await request(app)
        .post("/api/fields")
        .send({ name: TEST_FIELD_NAME, corners: testCorners })
        .expect(201);

      expect(response.body).toHaveProperty("field_name", TEST_FIELD_NAME);
      
      // Stocker l'ID pour les tests suivants
      if (response.body.id) {
        createdFieldId = response.body.id;
      }
      
      console.log(`✅ Terrain créé: "${TEST_FIELD_NAME}" (ID: ${createdFieldId || 'N/A'})`);
    });

    it("le terrain créé devrait apparaître dans la liste des terrains", async () => {
      const response = await request(app)
        .get("/api/fields")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      const terrain = response.body.find((f) => f.name === TEST_FIELD_NAME);
      expect(terrain).toBeDefined();
      expect(terrain.corners).toBeDefined();
      
      // Vérifier les coordonnées
      expect(terrain.corners.tl.coords.latitude).toBeCloseTo(testCorners.tl.coords.latitude, 4);
      expect(terrain.corners.tl.coords.longitude).toBeCloseTo(testCorners.tl.coords.longitude, 4);
      expect(terrain.corners.br.coords.latitude).toBeCloseTo(testCorners.br.coords.latitude, 4);
      expect(terrain.corners.br.coords.longitude).toBeCloseTo(testCorners.br.coords.longitude, 4);
      
      console.log(`✅ Terrain "${TEST_FIELD_NAME}" trouvé dans la liste avec les bonnes coordonnées`);
    });
  });

  // ============================================================
  // TEST 3 – Affichage du terrain (avant suppression)
  // Charger un terrain et vérifier que les données sont correctes
  // ============================================================
  describe("Test 3 – Affichage du terrain (DB réelle)", () => {
    
    it("le terrain chargé devrait avoir les 4 coins avec coordonnées numériques", async () => {
      const response = await request(app)
        .get("/api/fields")
        .expect(200);

      const terrain = response.body.find((f) => f.name === TEST_FIELD_NAME);
      expect(terrain).toBeDefined();

      // Vérifier la structure des coins
      ["tl", "tr", "bl", "br"].forEach((corner) => {
        expect(terrain.corners[corner]).toHaveProperty("coords");
        expect(typeof terrain.corners[corner].coords.latitude).toBe("number");
        expect(typeof terrain.corners[corner].coords.longitude).toBe("number");
      });
      
      console.log(`✅ Structure des 4 coins valide pour "${TEST_FIELD_NAME}"`);
    });

    it("les proportions du terrain devraient être cohérentes", async () => {
      const response = await request(app)
        .get("/api/fields")
        .expect(200);

      const terrain = response.body.find((f) => f.name === TEST_FIELD_NAME);
      expect(terrain).toBeDefined();

      // Calculer les dimensions approximatives
      const lat = terrain.corners.tl.coords.latitude;
      const widthDeg = Math.abs(
        terrain.corners.tr.coords.longitude - terrain.corners.tl.coords.longitude
      );
      const heightDeg = Math.abs(
        terrain.corners.tl.coords.latitude - terrain.corners.bl.coords.latitude
      );

      // Convertir en mètres (approximation)
      const widthMeters = widthDeg * 111000 * Math.cos((lat * Math.PI) / 180);
      const heightMeters = heightDeg * 111000;

      console.log(`📏 Dimensions approximatives: ${heightMeters.toFixed(1)}m x ${widthMeters.toFixed(1)}m`);
      
      // Vérifier que les dimensions sont raisonnables (> 0)
      expect(widthMeters).toBeGreaterThan(0);
      expect(heightMeters).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // TEST 2 – Suppression de terrain
  // Supprimer le terrain créé, vérifier qu'il disparaît de la liste.
  // ============================================================
  describe("Test 2 – Suppression de terrain (DB réelle)", () => {
    
    it("devrait supprimer le terrain créé par son nom", async () => {
      const response = await request(app)
        .delete(`/api/fields/${encodeURIComponent(TEST_FIELD_NAME)}`)
        .expect(200);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("deleted");
      
      console.log(`✅ Terrain "${TEST_FIELD_NAME}" supprimé`);
    });

    it("le terrain supprimé ne devrait plus apparaître dans la liste", async () => {
      const response = await request(app)
        .get("/api/fields")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      const terrain = response.body.find((f) => f.name === TEST_FIELD_NAME);
      expect(terrain).toBeUndefined();
      
      console.log(`✅ Terrain "${TEST_FIELD_NAME}" absent de la liste (suppression confirmée)`);
    });

    it("supprimer un terrain inexistant devrait retourner 404", async () => {
      const response = await request(app)
        .delete(`/api/fields/${encodeURIComponent(TEST_FIELD_NAME)}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("not found");
      
      console.log(`✅ Erreur 404 correctement retournée pour terrain inexistant`);
    });
  });
});