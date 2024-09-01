const{ Tag } = require("../models");

const tagController = {
    async renderAllTagsPage(req, res) {
        const tags = await Tag.findAll({
            include: [ "quizzes" ],
        });

        res.render("tags", { tags });
    },
};

module.exports = tagController;