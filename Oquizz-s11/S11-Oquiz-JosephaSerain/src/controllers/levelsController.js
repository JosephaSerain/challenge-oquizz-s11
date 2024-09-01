const { Level } = require("../models");

const levelController = {
    async renderAllLevelsPage(req, res) {
        const levels = await Level.findAll();

        res.render("levels", { levels });
    },

    async createOneLevel(req, res) {
        const { name } = req.body;
        // Identique à la ligne suivante
        // const name = req.body.name;

        const levels = await Level.findAll();

        // On recherche en BDD si on a déjà un level avec ce nom => on ne veut pas de doublons
        for (const level of levels) {
            if (level.name.trim().toLowerCase() === name.trim().toLowerCase()) {
                return res.render("levels", { levels, errorMessage: "Un niveau du même nom existe déjà !!!" });
            }
        }

        // On enregistre le nouveau niveau
        const newLevel = await Level.create({ name });

        // On l'ajoute à la liste qu'on avait déjà
        levels.push(newLevel);

        // Puis on affiche la page avec message de succès et liste à jour
        res.render("levels", { levels, successMessage: "Le niveau a bien été créé !" });
    },

    async deleteOneLevel(req, res) {
        // Attention, les paramètres récupérés dans l'URL sont en String.
        // Si on veut comparer cet id à d'autres plus bas, attention de bien le typer en Number => ici integer.
        const levelId = parseInt(req.params.id);

        // let levels = await Level.findAll();

        // // On s'assure que l'id correspond bien à un level existant : sinon message d'erreur
        // const levelToDelete = await Level.findByPk(levelId);
        // if (!levelToDelete) {
        //     return res.render("levels", { levels, errorMessage: "Le niveau à supprimer n'existe pas !" });
        // }

        // await levelToDelete.destroy();
        // levels = await Level.findAll();

        // res.render("levels", { levels, successMessage: "Le niveau a bien été supprimé !" });

        const levels = await Level.findAll({include: [ "questions" ]});

        let levelToDelete;
        const finalLevelsList = []; // Sera une copie de levels, sans celui à supprimer...
        for (const level of levels) {
            if (level.id === levelId) {
                levelToDelete = level;
            } else {
                finalLevelsList.push(level);
            }
        }

        // Quand on arrive ici, finalLevelsList est identique à levels, à l'exception faite qu'il ne contient pas
        // le level en cours de suppression.

        if (!levelToDelete) {
            return res.render("levels", { levels, errorMessage: "Le niveau à supprimer n'existe pas !" });
        }

        if (levelToDelete.questions.length > 0) {
            return res.render("levels", { levels, errorMessage: "Ce niveau est affecté à au moins une question et ne peut donc pas être supprimer !" });
        }

        await levelToDelete.destroy();

        res.render("levels", { levels: finalLevelsList, successMessage: "Le niveau a bien été supprimé !" });
    },

    async renderEditLevelPage(req, res) {
        const level = await Level.findByPk(req.params.id);
        if (!level) {
            return res.status(404).render("404");
        }

        res.render("level", { level });
    },

    async updateOneLevel(req, res) {
        const id = req.params.id;
        const name = req.body.name;

        // On s'assure que le level existe
        const level = await Level.findByPk(id);
        if (!level) {
            return res.status(404).render("404");
        }

        // On s'assure que le name soit bien soumis
        if (!name) {
            return res.render("level", { level, errorMessage: "Il faut saisir un nouveau nom !" });
        }

        // On s'assure que le nouveau nom n'est pas déjà utilisé.
        const alreadyExistingLevelWithSameName = await Level.findOne({ where: { name } });
        if (alreadyExistingLevelWithSameName) {
            return res.render("level", { level, errorMessage: "Il existe déjà un niveau avec ce nom !" });
        }

        level.name = name;
        level.save();

        return res.render("level", { level, successMessage: "Le niveau a bien été modifié !" });
    },
};

module.exports = levelController;