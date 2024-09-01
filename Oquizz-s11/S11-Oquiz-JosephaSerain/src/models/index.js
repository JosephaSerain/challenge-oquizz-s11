const Quiz = require("./Quiz");
const User = require("./User");
const Question = require("./Question");
const Level = require("./Level");
const Tag = require("./Tag");
const Answer = require("./Answer");

// Objectif de ce fichier (dont le nom est michelisable)
// est de définir les associations entre nos modèles

// DOC: https://sequelize.org/docs/v6/core-concepts/assocs/

// One-to-One : hasOne + belongsTo
// One-to-Many : hasMany + belongsTo
// Many-to-Many : belongsToMany + belongsToMany


// Quiz <-> User (One-to-Many)
User.hasMany(Quiz, {
  foreignKey: "user_id",
  as: "quizzes" // alias pour l'association, pour faciliter les "include" dans les queries
});
Quiz.belongsTo(User, {
  foreignKey: "user_id",
  as: "author"
});

// Quiz <-> Question (One-to-Many)
Quiz.hasMany(Question, {
  foreignKey: "quiz_id",
  as: "questions"
});
Question.belongsTo(Quiz, {
  foreignKey: "quiz_id",
  as: "quiz"
});

// Level <-> Question (One-to-Many)
Level.hasMany(Question, {
  foreignKey: "level_id",
  as: "questions"
});
Question.belongsTo(Level, {
  foreignKey: "level_id",
  as: "level"
});

// Quiz <-> Tag (Many-to-Many)
Quiz.belongsToMany(Tag, {
  through: "quiz_has_tag", // C'est le nom de la table de liaison entre les 2 tables
  as: "tags",
  foreignKey: "quiz_id"
});
Tag.belongsToMany(Quiz, {
  through: "quiz_has_tag",
  as: "quizzes",
  foreignKey: "tag_id"
});

// Question <-> Answer (One-To-Many)
Question.hasMany(Answer, {
  foreignKey: "question_id",
  as: "propositions"
});
Answer.belongsTo(Question, {
  foreignKey: "question_id",
  as: "question"
});

// Question <-> Answer (One-To-One)
Question.belongsTo(Answer, {
  foreignKey: "answer_id",
  as: "good_answer"
});
Answer.hasOne(Question, {
  foreignKey: "answer_id",
  as: "question_it_validates"
});


module.exports = { User, Quiz, Question, Level, Tag, Answer };
