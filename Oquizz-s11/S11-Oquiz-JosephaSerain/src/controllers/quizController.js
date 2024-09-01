const{ Quiz } = require("../models");

const quizController = {
    async renderOneQuizPage(req, res) {
        const quiz = await Quiz.findByPk(req.params.id, {
            include: [
                "author",
                // { association: "author" },
                "tags",
                // { association: "tags" },
                { association: "questions", include: ["propositions", "level"] }
            ]
        });

        // On pense à s'assurer qu'on a bien trouvé le quiz demandé, sinon 404...
        if (!quiz) {
            res.status(404).render("404");
            return;
        }

        res.render("quiz", { quiz });
    },
};

module.exports = quizController;