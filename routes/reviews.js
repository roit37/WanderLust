const express = require("express");
const router = express.Router({ mergeParams: true });
const reviews = require("../controllers/reviews");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isReviewAuthor } = require("../middleware/auth");
const { validateReview } = require("../middleware/validate");

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
