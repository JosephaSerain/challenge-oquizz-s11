
// Charger les variables d'environnement
const dotenv = require("dotenv");
dotenv.config();

// Importer les dependances
const express = require("express");
require('express-async-errors'); // Module pour faciliter la gestion des erreurs => notre fameux try catch
const router = require("./src/router");

const session = require('express-session');

// Création de l'application express
const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Nickel pour les session de connexion d'après la doc du module
    cookie: { secure: false } // On est pas en HTTPS mais en HTTP
}));

// Configurer le view engine
app.set("view engine", "ejs");
app.set("views", "./src/views");

// On expose le contenu du dossier public au reste du monde
app.use(express.static("public")); // Ca revient à déclarer une route par fichier en quelque sorte

// Notre body parser pour les requêtes POST
app.use(express.urlencoded({ extended: true }));

// On plug le router
app.use(router);

// Cette partie gère les page 404 dans le cas où l'URL demandé ne correspond à aucune route.
// Pour les page comme quiz/700000 par exemple, ce n'est pas concerné, car cette URL correspond bien à quiz/:id.
// Dans ce cas d'exemple, il faut gérer la 404 dans le controller.
app.use((req, res) => {
    res.status(404).render("404");
});

// Middleware qui permet de catcher les erreurs qui n'auraient pas déjà été catchée.
// Fonctionne avec le module express-async-errors.
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render("500");
});

// Lancer l'application
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`);
});
