const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");

const config = require("./config");

const adminRoutes = require("./routes/admin");
const apiRoutes = require("./routes/api");

const app = express();

app.disable("x-powered-by");

app.use(express.json({
  limit: "10kb"
}));

app.use(express.urlencoded({
  extended: false,
  limit: "10kb"
}));

app.use(cookieParser());

app.use(express.static(
  path.join(__dirname, "..", "public")
));

app.use("/admin", adminRoutes);
app.use("/api", apiRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "public", "login.html")
  );
});

app.use((req, res) => {
  res.status(404).json({
    error: "Not found"
  });
});

app.use((err, req, res, next) => {
  console.error("Erreur serveur :", err);

  res.status(500).json({
    error: "Erreur serveur"
  });
});

app.listen(config.port, () => {
  console.log("");
  console.log("=================================");
  console.log(" Roblox Key System");
  console.log("=================================");
  console.log(`Serveur : http://localhost:${config.port}`);
  console.log(`Environnement : ${config.nodeEnv}`);
  console.log("");
});
