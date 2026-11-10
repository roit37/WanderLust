const Listing = require("../models/listing");
const Review = require("../models/review");
const Booking = require("../models/booking");

const isLoggedIn = (req, res, next) => {
    if (!req.session.userId) {
        if (req.xhr || req.headers.accept?.includes("json")) {
            return res.status(401).json({ success: false, message: "You must be signed in to perform this action." });
        }
        if (req.method === "GET") {
            req.session.returnTo = req.originalUrl;
        } else {
            req.session.returnTo = req.get("Referrer") || "/listings";
        }
        req.flash("error", "You must be signed in to perform this action.");
        return res.redirect("/login");
    }
    next();
};

const isLoggedOut = (req, res, next) => {
    if (req.session.userId) {
        req.flash("info", "You are already signed in.");
        return res.redirect("/listings");
    }
    next();
};

const isHost = (req, res, next) => {
    if (!req.session.userId) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be signed in to access host features.");
        return res.redirect("/login");
    }
    if (res.locals.currentUser.role !== "host" && res.locals.currentUser.role !== "admin") {
        req.flash("error", "You need a Host account to create and manage properties.");
        return res.redirect("/dashboard/guest");
    }
    next();
};

const isAdmin = (req, res, next) => {
    if (!req.session.userId) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "Admin authentication required.");
        return res.redirect("/login");
    }
    if (res.locals.currentUser.role !== "admin") {
        req.flash("error", "Access restricted to platform administrators.");
        return res.redirect("/listings");
    }
    next();
};

const isListingOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }
    const isOwner = listing.owner && listing.owner.equals(req.session.userId);
    const isAdminUser = res.locals.currentUser && res.locals.currentUser.role === "admin";

    if (!isOwner && !isAdminUser) {
        req.flash("error", "You do not have permission to modify this property.");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found.");
        return res.redirect(`/listings/${id}`);
    }
    const isAuthor = review.author && review.author.equals(req.session.userId);
    const isAdminUser = res.locals.currentUser && res.locals.currentUser.role === "admin";

    if (!isAuthor && !isAdminUser) {
        req.flash("error", "You do not have permission to delete this review.");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

const isBookingParty = async (req, res, next) => {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate("listing");
    if (!booking) {
        req.flash("error", "Booking not found.");
        return res.redirect("/bookings/my-trips");
    }
    const isGuest = booking.user.equals(req.session.userId);
    const isHost = booking.listing && booking.listing.owner && booking.listing.owner.equals(req.session.userId);
    const isAdminUser = res.locals.currentUser && res.locals.currentUser.role === "admin";

    if (!isGuest && !isHost && !isAdminUser) {
        req.flash("error", "You do not have permission to view or manage this reservation.");
        return res.redirect("/listings");
    }
    req.booking = booking;
    next();
};

module.exports = {
    isLoggedIn,
    isLoggedOut,
    isHost,
    isAdmin,
    isListingOwner,
    isReviewAuthor,
    isBookingParty
};
