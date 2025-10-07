import React, { useState } from "react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (isLogin) {
      alert("Tentative de connexion...");
    } else {
      alert("Création d’un nouvel utilisateur...");
    }
  }

  function toggleMode() {
    if (isLogin) {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }

  // Définir les titres et textes selon le mode
  let title = "";
  let buttonText = "";
  let footerText = "";
  let footerAction = "";

  if (isLogin) {
    title = "Connexion";
    buttonText = "Se connecter";
    footerText = "Pas encore de compte ?";
    footerAction = "Créer un compte";
  } else {
    title = "Créer un compte";
    buttonText = "S’inscrire";
    footerText = "Déjà un compte ?";
    footerAction = "Se connecter";
  }

  return (
    <div style={styles.container}>
      <h1>{title}</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="email" placeholder="Email" required style={styles.input} />
        <input
          type="password"
          placeholder="Mot de passe"
          required
          style={styles.input}
        />

        {/* Champ supplémentaire si c’est une inscription */}
        {!isLogin && (
          <input
            type="password"
            placeholder="Confirmez le mot de passe"
            required
            style={styles.input}
          />
        )}

        <button type="submit" style={styles.button}>
          {buttonText}
        </button>
      </form>

      <p style={styles.toggleText}>
        {footerText}{" "}
        <button onClick={toggleMode} style={styles.linkButton}>
          {footerAction}
        </button>
      </p>
    </div>
  );
}

// --- Styles simples
const styles = {
  container: {
    width: "100%",
    maxWidth: 400,
    margin: "50px auto",
    padding: 20,
    border: "1px solid #ccc",
    borderRadius: 10,
    textAlign: "center" as const,
    backgroundColor: "#f9f9f9",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
    marginTop: 20,
  },
  input: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    padding: 10,
    borderRadius: 6,
    fontSize: 16,
    cursor: "pointer",
  },
  toggleText: {
    marginTop: 15,
    fontSize: 14,
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#3498db",
    textDecoration: "underline",
    cursor: "pointer",
    fontSize: 14,
    marginLeft: 5,
  },
};
