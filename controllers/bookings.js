const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { createBooking, calculateBookingPrice, checkAvailability } = require("../services/bookingService");
const ExpressError = require("../utils/ExpressError");

/**
 * Preview / confirmation page before booking
 */
const renderCheckout = async (req, res) => {
    const { listingId } = req.params;
    const { checkIn, checkOut, guests = 1 } = req.query;

    if (!checkIn || !checkOut) {
        req.flash("error", "Please select valid check-in and check-out dates.");
        return res.redirect(`/listings/${listingId}`);
    }

    const listing = await Listing.findById(listingId).populate("owner", "name username");
    if (!listing) {
        throw new ExpressError(404, "Listing not found.");
    }

    const isAvailable = await checkAvailability(listingId, checkIn, checkOut);
    if (!isAvailable) {
        req.flash("error", "The property is unavailable for the selected dates. Please choose alternate dates.");
        return res.redirect(`/listings/${listingId}`);
    }

    const priceBreakdown = calculateBookingPrice(listing.price, checkIn, checkOut, Number(guests));

    res.render("bookings/checkout", {
        listing,
        checkIn,
        checkOut,
        guests: Number(guests),
        priceBreakdown
    });
};

/**
 * Confirm and save booking
 */
const postBooking = async (req, res) => {
    const { listingId } = req.params;
    const { checkIn, checkOut, guests, specialRequests } = req.body.booking;

    const booking = await createBooking({
        listingId,
        userId: req.session.userId,
        checkIn,
        checkOut,
        guests: Number(guests),
        specialRequests
    });

    req.flash("success", "Reservation confirmed! Have a wonderful trip.");
    res.redirect("/bookings/my-trips");
};

/**
 * Guest dashboard: view all trips
 */
const getGuestBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.session.userId })
        .populate({
            path: "listing",
            populate: {
                path: "owner",
                select: "name username email"
            }
        })
        .sort({ checkIn: -1 });

    res.render("bookings/guestBookings", {
        bookings
    });
};

/**
 * Host dashboard: view all incoming reservations
 */
const getHostReservations = async (req, res) => {
    // Find all listings owned by current user
    const hostListings = await Listing.find({ owner: req.session.userId }).select("_id");
    const listingIds = hostListings.map((l) => l._id);

    const reservations = await Booking.find({ listing: { $in: listingIds } })
        .populate("listing")
        .populate("user", "name username email avatar")
        .sort({ createdAt: -1 });

    res.render("bookings/hostReservations", {
        reservations
    });
};

/**
 * Cancel a booking
 */
const cancelBooking = async (req, res) => {
    const { id } = req.params;
    const booking = req.booking; // attached by isBookingParty middleware

    if (booking.status === "cancelled") {
        req.flash("info", "This reservation has already been cancelled.");
        return res.redirect("/bookings/my-trips");
    }

    booking.status = "cancelled";
    await booking.save();

    req.flash("success", "Reservation successfully cancelled.");
    if (res.locals.currentUser.role === "host") {
        return res.redirect("/bookings/host-reservations");
    }
    res.redirect("/bookings/my-trips");
};

/**
 * Host/Admin status update (confirm, decline, complete)
 */
const updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["confirmed", "cancelled", "completed"].includes(status)) {
        req.flash("error", "Invalid booking status.");
        return res.redirect("/bookings/host-reservations");
    }

    const booking = req.booking;
    booking.status = status;
    await booking.save();

    req.flash("success", `Reservation status updated to: ${status}`);
    res.redirect("/bookings/host-reservations");
};

module.exports = {
    renderCheckout,
    postBooking,
    getGuestBookings,
    getHostReservations,
    cancelBooking,
    updateBookingStatus
};
