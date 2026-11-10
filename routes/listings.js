const express = require("express");
const router = express.Router();
const listings = require("../controllers/listings");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isHost, isListingOwner } = require("../middleware/auth");
const { validateListing } = require("../middleware/validate");
const { upload } = require("../config/cloudinary");

router
    .route("/")
    .get(catchAsync(listings.index))
    .post(
        isLoggedIn,
        isHost,
        upload.single("imageFile"),
        validateListing,
        catchAsync(listings.createListing)
    );

router.get("/new", isLoggedIn, isHost, listings.renderNewForm);

router
    .route("/:id")
    .get(catchAsync(listings.showListing))
    .put(
        isLoggedIn,
        isListingOwner,
        upload.single("imageFile"),
        validateListing,
        catchAsync(listings.updateListing)
    )
    .delete(isLoggedIn, isListingOwner, catchAsync(listings.deleteListing));

router.get("/:id/edit", isLoggedIn, isListingOwner, catchAsync(listings.renderEditForm));

module.exports = router;
