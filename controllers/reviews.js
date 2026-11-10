const Listing = require("../models/listing");
const Review = require("../models/review");
const Booking = require("../models/booking");
const ExpressError = require("../utils/ExpressError");

const createReview = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found.");
    }

    if (listing.owner && listing.owner.equals(req.session.userId)) {
        req.flash("error", "You cannot leave a review on your own property.");
        return res.redirect(`/listings/${id}`);
    }

    // Check if user has a verified stay
    const userBooking = await Booking.findOne({
        listing: id,
        user: req.session.userId,
        status: { $in: ["confirmed", "completed"] }
    });

    const newReview = new Review({
        rating: Number(req.body.review.rating),
        comment: req.body.review.comment,
        author: req.session.userId,
        listing: id,
        verifiedBooking: Boolean(userBooking)
    });

    await newReview.save();

    listing.reviews.push(newReview._id);

    // Recalculate average rating
    const allReviews = await Review.find({ listing: id });
    const totalRatingSum = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
    listing.totalReviews = allReviews.length;
    listing.avgRating = allReviews.length > 0 ? Number((totalRatingSum / allReviews.length).toFixed(1)) : 0;

    await listing.save();

    req.flash("success", "Your review has been published!");
    res.redirect(`/listings/${id}`);
};

const deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    // Recalculate average rating
    const allReviews = await Review.find({ listing: id });
    const totalRatingSum = allReviews.reduce((sum, rev) => sum + rev.rating, 0);
    const avgRating = allReviews.length > 0 ? Number((totalRatingSum / allReviews.length).toFixed(1)) : 0;

    await Listing.findByIdAndUpdate(id, {
        totalReviews: allReviews.length,
        avgRating: avgRating
    });

    req.flash("success", "Review successfully deleted.");
    res.redirect(`/listings/${id}`);
};

module.exports = {
    createReview,
    deleteReview
};
