const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("./config");

const COOKIE_NAME = "admin_session";

async function checkPassword(password) {
  return bcrypt.compare(password, config.adminPasswordHash);
}

function createToken() {
  return jwt.sign(
    {
      role: "admin"
    },
    config.jwtSecret,
    {
      expiresIn: "12h"
    }
  );
}

function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return res.status(401).json({
        error: "Non authentifié"
      });
    }

    req.admin = verifyToken(token);

    next();
  } catch {
    return res.status(401).json({
      error: "Session invalide ou expirée"
    });
  }
}

module.exports = {
  COOKIE_NAME,
  checkPassword,
  createToken,
  verifyToken,
  requireAuth
};
