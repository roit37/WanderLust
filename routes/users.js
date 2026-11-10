const express = require("express");
const router = express.Router();
const users = require("../controllers/users");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isLoggedOut } = require("../middleware/auth");
const { validateUserRegister, validateUserLogin } = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");

router
    .route("/register")
    .get(isLoggedOut, users.renderRegisterForm)
    .post(isLoggedOut, authLimiter, validateUserRegister, catchAsync(users.register));

router
    .route("/login")
    .get(isLoggedOut, users.renderLoginForm)
    .post(isLoggedOut, authLimiter, validateUserLogin, catchAsync(users.login));

router.get("/logout", users.logout);

router
    .route("/profile")
    .get(isLoggedIn, catchAsync(users.renderProfile))
    .post(isLoggedIn, catchAsync(users.updateProfile));

module.exports = router;
