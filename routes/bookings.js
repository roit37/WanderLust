const express = require("express");
const router = express.Router();
const bookings = require("../controllers/bookings");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isHost, isBookingParty } = require("../middleware/auth");
const { validateBooking } = require("../middleware/validate");

// Guest trips list
router.get("/my-trips", isLoggedIn, catchAsync(bookings.getGuestBookings));

// Host reservations list
router.get("/host-reservations", isLoggedIn, isHost, catchAsync(bookings.getHostReservations));

// Checkout preview page
router.get("/checkout/:listingId", isLoggedIn, catchAsync(bookings.renderCheckout));

// Create booking POST
router.post("/create/:listingId", isLoggedIn, validateBooking, catchAsync(bookings.postBooking));

// Cancel booking POST
router.post("/:id/cancel", isLoggedIn, isBookingParty, catchAsync(bookings.cancelBooking));

// Update reservation status POST
router.post("/:id/status", isLoggedIn, isBookingParty, catchAsync(bookings.updateBookingStatus));

module.exports = router;
