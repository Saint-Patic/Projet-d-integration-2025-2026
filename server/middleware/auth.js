const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwt");

let JWT_SECRET = JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.JWT_SECRET === "production") {
    throw new error(
      "JWT_secret environment variable must be set in production"
    );
  } else {
    JWT_SECRET = "changeme";
  }
}

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token manquant" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
};

module.exports = authMiddleware;
