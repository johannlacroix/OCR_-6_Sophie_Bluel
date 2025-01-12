const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const yaml = require("yamljs");
const swaggerDocs = yaml.load("swagger.yaml");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use("/images", express.static(path.join(__dirname, "images")));

// Routes
const db = require("./models");
const userRoutes = require("./routes/user.routes");
const categoriesRoutes = require("./routes/categories.routes");
const worksRoutes = require("./routes/works.routes");

// Synchronisation de la base de données
db.sequelize.sync().then(() => console.log("db is ready"));

// Routes d'API
app.use("/api/users", userRoutes); // Route pour les utilisateurs
app.use("/api/categories", categoriesRoutes);
app.use("/api/works", worksRoutes);

// Documentation Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Exportation de l'app pour utilisation dans un autre fichier (par exemple pour démarrer le serveur)
module.exports = app;
