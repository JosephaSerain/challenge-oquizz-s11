function isLoggedInMiddleware(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
        return;
    }

    next();
}

function isAdminMiddleware(req, res, next) {
    if (!req.session.user) {
        res.redirect("/login");
        return;
    }

    if (req.session.user.role !== "admin") {
        res.redirect("/");
        return;
    }

    next();
}

module.exports = { isLoggedInMiddleware, isAdminMiddleware };