
const { Router } = require("express");

const { isLoggedInMiddleware, isAdminMiddleware } = require("./middlewares/rightsMiddlewares");

const mainController = require("./controllers/mainController");
const quizController = require("./controllers/quizController");
const tagController = require("./controllers/tagController");
const userAuthController = require("./controllers/userAuthController");
const levelController = require("./controllers/levelController");

const router = Router();

router.get("/", isLoggedInMiddleware, mainController.renderHomePage);

router.get("/quiz/:id", isLoggedInMiddleware, quizController.renderOneQuizPage);

router.get("/tags", isLoggedInMiddleware, tagController.renderAllTagsPage);

router.get("/levels", isAdminMiddleware, levelController.renderAllLevelsPage);
router.post("/levels", isAdminMiddleware, levelController.createOneLevel);
router.post("/levels/:id/delete", isAdminMiddleware, levelController.deleteOneLevel);
router.get("/levels/:id/edit", isAdminMiddleware, levelController.renderEditLevelPage);
router.post("/levels/:id/update", isAdminMiddleware, levelController.updateOneLevel);

router.get("/signup", userAuthController.renderSignUpPage);
router.post("/signup", userAuthController.handleSignUpFormSubmission);

router.get("/login", userAuthController.renderLoginPage);
router.post("/login", userAuthController.handleLoginFormSubmission);

router.get("/logout", isLoggedInMiddleware, userAuthController.logout);
router.get("/users/:id/edit", isLoggedInMiddleware, userAuthController.renderEditTagPage);
router.get("/tags/:id/edit", isLoggedInMiddleware, tagController.renderEditTagPage);

module.exports = router;
