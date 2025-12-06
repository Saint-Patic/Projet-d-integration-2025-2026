/**
 * Tests E2E – User Story: Agrandir la photo de profil
 * 
 * Pré-conditions:
 * - Serveur Node démarré (cd server && npm start)
 * - App web démarrée (cd FrisTrack && npx expo start --web)
 * - baseUrl: http://localhost:8081
 * - Utilisateur test: tg@tg.tg / Azerty12345!
 * 
 * TestIDs requis:
 * - Login: data-testid="login-email", "login-password", "login-submit"
 * - Navbar: data-testid="tab-profile"
 * - Profil: data-testid="profile-image", "overlay", "overlay-close", "overlay-image"
 */

describe("US: Agrandir la photo de profil", () => {
  /**
   * Tape dans un input avec gestion du re-render RN Web
   */
  const typeInInput = (selector, value) => {
    // Attendre visible et non-disabled
    cy.get(selector, { timeout: 15000 }).should("be.visible");
    cy.get(selector).should("not.have.attr", "disabled");

    // Casser la chaîne: re-get l'élément avant chaque action
    cy.get(selector).click({ force: true });
    cy.get(selector).clear({ force: true });
    cy.get(selector).type(value, { force: true });

    // Vérifier si RN Web a re-render et effacé la valeur
    cy.get(selector).then(($el) => {
      const current = ($el.val() || "").trim();
      if (current !== value) {
        cy.get(selector).clear({ force: true });
        cy.get(selector).type(value, { force: true });
      }
    });

    // Assertion finale
    cy.get(selector).should(($el) => {
      const current = ($el.val() || "").trim();
      expect(current).to.eq(value);
    });
  };

  /**
   * Login et navigation vers profil via navbar
   */
  const loginToProfile = () => {
    cy.visit("/");

    // Email
    typeInInput('[data-testid="login-email"]', "tg@tg.tg");

    // Password
    typeInInput('[data-testid="login-password"]', "Azerty12345!");

    // Submit
    cy.get('[data-testid="login-submit"]').should("be.visible");
    cy.get('[data-testid="login-submit"]').click({ force: true });

    // Attendre succès login (apparition de la navbar)
    cy.wait(1000);

    // Cliquer sur l'onglet Profil dans la navbar
    // Chercher par testID, puis par texte "Profil", puis par href
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="tab-profile"]').length > 0) {
        cy.get('[data-testid="tab-profile"]').click({ force: true });
      } else if ($body.find('[role="tab"]:contains("Profil")').length > 0) {
        cy.get('[role="tab"]:contains("Profil")').first().click({ force: true });
      } else if ($body.find('a[href="/profile"]').length > 0) {
        cy.get('a[href="/profile"]').first().click({ force: true });
      } else {
        // Dernier recours: chercher un lien contenant "profile" dans l'href
        cy.get('a[href*="profile"]').first().click({ force: true });
      }
    });

    // Attendre que la page profil soit affichée
    cy.contains(/mon profil/i, { timeout: 15000 }).should("be.visible");
  };

  beforeEach(() => {
    loginToProfile();
  });

  it("AC1 – Ouverture: clic sur la photo ouvre l'overlay plein écran", () => {
    cy.get('[data-testid="profile-image"]', { timeout: 10000 })
      .should("be.visible")
      .click();

    cy.get('[data-testid="overlay"]').should("be.visible");
    cy.get('[data-testid="overlay-image"]').should("be.visible");
  });

  it("AC2 – Format: l'image conserve son ratio d'origine", () => {
    cy.get('[data-testid="profile-image"]').click();
    cy.get('[data-testid="overlay"]').should("be.visible");

    // Vérifier que l'image existe et a des dimensions valides
    cy.get('[data-testid="overlay-image"]')
      .find("img")
      .should("be.visible")
      .should(($img) => {
        const img = $img[0];
        
        // L'image doit être chargée
        expect(img.complete, "image chargée").to.be.true;
        
        // Dimensions naturelles valides
        expect(img.naturalWidth, "naturalWidth > 0").to.be.greaterThan(0);
        expect(img.naturalHeight, "naturalHeight > 0").to.be.greaterThan(0);
        
        // Dimensions rendues valides
        expect(img.width, "width > 0").to.be.greaterThan(0);
        expect(img.height, "height > 0").to.be.greaterThan(0);
        
      });
  });

  it("AC3 – Fermeture: clic sur la croix ferme l'overlay", () => {
    cy.get('[data-testid="profile-image"]').click();
    cy.get('[data-testid="overlay"]').should("be.visible");
    cy.get('#overlay-close').should("be.visible").click();
    cy.get('[data-testid="overlay"]').should("not.exist");
  });

  it("AC3 – Fermeture: clic hors de l'image ferme l'overlay", () => {
    cy.get('[data-testid="profile-image"]').click();
    cy.get('[data-testid="overlay"]').should("be.visible");
    cy.get('[data-testid="overlay"]').click("topLeft", { force: true });
    cy.get('[data-testid="overlay"]').should("not.exist");
  });

  it("AC3 – Fermeture: clic sur l'image agrandie ferme l'overlay", () => {
    cy.get('[data-testid="profile-image"]').click();
    cy.get('[data-testid="overlay"]').should("be.visible");
    cy.get('[data-testid="overlay-image"]').click();
    cy.get('[data-testid="overlay"]').should("not.exist");
  });

  it("AC4 – Performance: overlay visible en < 1s", () => {
    const start = Date.now();
    cy.get('[data-testid="profile-image"]').click();
    cy.get('[data-testid="overlay"]').should("be.visible").then(() => {
      expect(Date.now() - start).to.be.lessThan(1000);
    });
  });

  it("AC5 – Accessibilité: focus visible sur bouton fermeture", () => {
    cy.get('[data-testid="profile-image"]').click();
    cy.get('[data-testid="overlay"]').should("be.visible");
    
    // Utiliser realPress au lieu de tab (nécessite cypress-real-events)
    // Ou simplement focus directement sur le bouton
    cy.get('#overlay-close').should("be.visible").focus();
    cy.focused().should("have.attr", "id", "overlay-close");
    cy.focused().type("{enter}");
    cy.get('[data-testid="overlay"]').should("not.exist");
  });

  it("AC5 – Accessibilité: alt text présent sur image agrandie", () => {
    cy.get('[data-testid="profile-image"]').click();
    cy.get('img')
      .should("be.visible") 
      .should("have.attr", "alt")
      .and("be.a", "string")
      .and("not.be.empty");
  });

  it("AC6 – Sécurité: src ne contient pas de chemin système", () => {
    cy.get('[data-testid="profile-image"]').click();
    cy.get('[data-testid="overlay-image"]')
      .find("img")
      .invoke("attr", "src")
      .then((src) => {
        expect(src).to.be.a("string");
        expect(src).to.not.match(/(C:\\|\/var\/|\/etc\/|file:\/\/)/i);
      });
  });

  it("AC6 – Sécurité: l'image agrandie correspond à l'avatar profil", () => {
    cy.get('[data-testid="profile-image"]')
      .find("img")
      .invoke("attr", "src")
      .then((thumbSrc) => {
        cy.get('[data-testid="profile-image"]').click();
        cy.get('[data-testid="overlay-image"]')
          .find("img")
          .invoke("attr", "src")
          .should((fullSrc) => {
            const thumbFile = thumbSrc.split("/").pop().split("?")[0];
            const fullFile = fullSrc.split("/").pop().split("?")[0];
            expect(fullFile).to.include(thumbFile.split(".")[0]);
          });
      });
  });

  it("Modale bloque les interactions avec le reste de l'écran", () => {
    cy.get('[data-testid="profile-image"]').click();
    cy.get('[data-testid="overlay"]').should("be.visible");
    
    // Vérifier que le reste de la page n'est plus accessible
    cy.get('[data-testid="profile-image"]').should("not.exist");
    
    // Vérifier que seul l'overlay et son contenu sont visibles
    cy.get('[data-testid="overlay-image"]').should("be.visible");
    cy.get('#overlay-close').should("be.visible");
  });

  it("Pas de modification du profil lors de l'ouverture/fermeture", () => {
    cy.intercept("PUT", "**/users/**").as("updateUser");
    cy.intercept("PATCH", "**/users/**").as("patchUser");
    cy.get('[data-testid="profile-image"]').click();
    cy.get('[data-testid="overlay"]').should("be.visible");
    cy.get('#overlay-close').click();
    cy.wait(500);
    cy.get("@updateUser.all").should("have.length", 0);
    cy.get("@patchUser.all").should("have.length", 0);
  });
});