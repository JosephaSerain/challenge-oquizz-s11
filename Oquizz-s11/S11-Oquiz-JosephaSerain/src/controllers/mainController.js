const{ Quiz } = require("../models");
// C'est la même chose que la ligne suivante. "models" étant un dossier, node va automatiquement chercher dedans un fichier nommé index.js
// Du coup, préciser index ne sert pas à grand chose.
// const{ Quiz } = require("../models/index");

const mainController = {
    async renderHomePage(req, res) {
        console.log(req.session.user);

        // On va commencer par récupérer les données.
        const quizzes = await Quiz.findAll({
            include: [ "author", "tags" ],
            // order: [["title", "ASC"]]
            // Comme par défaut un tri est ASC, on peut ne pas le spécifier pour notre title.
            // Dans ce cas, même pas besoin du sous-tableau.
            order: ["title"]
        });

        // Ensuite, on s'assure de bien avoir tout ce qu'il faut => en gros on test avec un console.log par exemple.
        // console.log(quizzes);

        // A la fin seulement, je commence à m'occuper de la vue.
        res.render("home", { quizzes });
    },
};

module.exports = mainController;