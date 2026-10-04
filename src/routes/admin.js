const express = require("express");
const {
  checkPassword,
  createToken,
  COOKIE_NAME,
  requireAuth
} = require("../auth");

const {
  createKey,
  revokeKey,
  listKeys
} = require("../keys");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { password } = req.body;

    if (
      typeof password !== "string" ||
      password.length === 0
    ) {
      return res.status(400).json({
        error: "Mot de passe requis"
      });
    }

    const valid = await checkPassword(password);

    if (!valid) {
      return res.status(401).json({
        error: "Mot de passe incorrect"
      });
    }

    const token = createToken();

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: require("../config").cookieSecure,
      sameSite: "strict",
      maxAge: 12 * 60 * 60 * 1000,
      path: "/"
    });

    return res.json({
      success: true
    });
  } catch (error) {
    console.error("Erreur login :", error);

    return res.status(500).json({
      error: "Erreur serveur"
    });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: require("../config").cookieSecure,
    sameSite: "strict",
    path: "/"
  });

  res.json({
    success: true
  });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({
    authenticated: true
  });
});

router.get("/keys", requireAuth, async (req, res) => {
  try {
    const keys = await listKeys();

    res.json({
      keys
    });
  } catch (error) {
    console.error("Erreur liste clés :", error);

    res.status(500).json({
      error: "Impossible de récupérer les clés"
    });
  }
});

router.post("/keys", requireAuth, async (req, res) => {
  try {
    const { duration } = req.body;

    const allowedDurations = [
      "1d",
      "7d",
      "30d",
      "unlimited"
    ];

    if (!allowedDurations.includes(duration)) {
      return res.status(400).json({
        error: "Durée invalide"
      });
    }

    const result = await createKey(
      duration,
      "admin_panel"
    );

    res.json({
      success: true,
      key: result.key,
      record: result.record
    });
  } catch (error) {
    console.error("Erreur génération clé :", error);

    res.status(500).json({
      error: "Impossible de générer la clé"
    });
  }
});

router.post("/keys/:id/revoke", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await revokeKey(id);

    res.json({
      success: true,
      key: result
    });
  } catch (error) {
    console.error("Erreur révocation :", error);

    res.status(500).json({
      error: "Impossible de révoquer la clé"
    });
  }
});

module.exports = router;
