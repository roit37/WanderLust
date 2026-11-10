const ExpressError = require("../utils/ExpressError");
const {
    listingSchema,
    reviewSchema,
    bookingSchema,
    userRegisterSchema,
    userLoginSchema
} = require("../validators/schemas");

const validateListing = (req, res, next) => {
    // If amenities was sent as a comma-separated string or array, normalize it
    if (req.body.listing && typeof req.body.listing.amenities === "string") {
        req.body.listing.amenities = req.body.listing.amenities
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean);
    }

    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, msg);
    }
    next();
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, msg);
    }
    next();
};

const validateBooking = (req, res, next) => {
    const { error } = bookingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, msg);
    }
    next();
};

const validateUserRegister = (req, res, next) => {
    const { error } = userRegisterSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(", ");
        req.flash("error", msg);
        return res.redirect("/register");
    }
    next();
};

const validateUserLogin = (req, res, next) => {
    const { error } = userLoginSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(", ");
        req.flash("error", msg);
        return res.redirect("/login");
    }
    next();
};

module.exports = {
    validateListing,
    validateReview,
    validateBooking,
    validateUserRegister,
    validateUserLogin
};
