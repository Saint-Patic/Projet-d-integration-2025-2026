const validator = require("validator");

// Validation des noms (prénom, nom)
const validateName = (name) => {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 50) return false;
  return /^[a-zA-ZÀ-ÿ\s\-]{2,50}$/.test(trimmed);
};

// Validation du pseudo
const validatePseudo = (pseudo) => {
  if (!pseudo || typeof pseudo !== "string") return false;
  const trimmed = pseudo.trim();
  if (trimmed.length < 3 || trimmed.length > 30) return false;

  return /^[a-zA-Z0-9_\-]{3,30}$/.test(trimmed);
};

// Validation de l'email
const validateEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  return validator.isEmail(email) && email.length <= 100;
};

// Validation du mot de passe
const validatePassword = (password) => {
  if (!password || typeof password !== "string") return false;
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
  return regex.test(password) && password.length <= 128;
};

// Validation de la date de naissance
const validateBirthdate = (birthdate) => {
  if (!birthdate) return false;
  const date = new Date(birthdate);
  if (isNaN(date.getTime())) return false;

  const now = new Date();
  const minAge = 5; // Au moins 5 ans
  const maxAge = 120; // Maximum 120 ans

  const age = now.getFullYear() - date.getFullYear();
  return age >= minAge && age <= maxAge && date <= now;
};

// Validation des nombres dans une plage
const validateNumberInRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

// Validation de la pointure
const validateFootSize = (size) => {
  return validateNumberInRange(size, 15, 65);
};

// Validation du poids
const validateWeight = (weight) => {
  return validateNumberInRange(weight, 10, 300);
};

// Validation de la taille
const validateHeight = (height) => {
  return validateNumberInRange(height, 50, 250);
};

// Validation de la main dominante
const validateDominantHand = (hand) => {
  const validHands = ["left", "right", "ambidextrous"];
  return validHands.includes(hand);
};

// Validation du user_type
const validateUserType = (type) => {
  const validTypes = ["playeronly", "coachonly", "both"];
  return validTypes.includes(type);
};

// Validation du role_attack
const validateRoleAttack = (role) => {
  const validRoles = ["handler", "stack"];
  return validRoles.includes(role);
};

// Validation de l'ID - stricte pour rejeter les décimales et caractères spéciaux
const validateId = (id) => {
  // Convertir en string pour vérifier le format
  const idStr = String(id);

  // Rejeter si contient des caractères non numériques (sauf signe moins au début)
  if (!/^-?\d+$/.test(idStr)) return false;

  const num = parseInt(id, 10);
  return !isNaN(num) && num > 0 && num <= 2147483647;
};

// Sanitize string (enlever les caractères dangereux)
const sanitizeString = (str) => {
  if (typeof str !== "string") return "";
  return validator.escape(str.trim());
};

module.exports = {
  validateName,
  validatePseudo,
  validateEmail,
  validatePassword,
  validateBirthdate,
  validateFootSize,
  validateWeight,
  validateHeight,
  validateDominantHand,
  validateUserType,
  validateRoleAttack,
  validateId,
  sanitizeString,
  validateNumberInRange,
};
