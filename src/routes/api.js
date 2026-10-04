const express = require("express");
const rateLimit = require("express-rate-limit");
const { verifyKey } = require("../keys");
const config = require("../config");

const router = express.Router();

const verifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
});

router.post("/verify", verifyLimiter, async (req, res) => {
  try {
    const apiKey = req.get("X-API-Key");

    if (!apiKey || apiKey !== config.robloxApiKey) {
      return res.status(401).json({
        valid: false,
        reason: "unauthorized"
      });
    }

    const { key } = req.body;

    const result = await verifyKey(key);

    return res.json(result);
  } catch (error) {
    console.error("Erreur /api/verify :", error);

    return res.status(500).json({
      valid: false,
      reason: "server_error"
    });
  }
});

module.exports = router;
