const express = require("express");
const router = express.Router();
const wishlists = require("../controllers/wishlists");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require("../middleware/auth");

router.get("/", isLoggedIn, catchAsync(wishlists.renderWishlist));
router.post("/toggle/:listingId", isLoggedIn, catchAsync(wishlists.toggleWishlist));

module.exports = router;
