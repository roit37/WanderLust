const Booking = require("../models/booking");
const Listing = require("../models/listing");
const { createBooking, calculateBookingPrice, checkAvailability } = require("../services/bookingService");
const { isRazorpayConfigured, createRazorpayOrder, verifyPaymentSignature } = require("../config/razorpay");
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
        priceBreakdown,
        isRazorpayConfigured,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || ""
    });
};

/**
 * Initiate Razorpay Order for Checkout
 */
const createOrder = async (req, res) => {
    const { listingId } = req.params;
    const { checkIn, checkOut, guests = 1 } = req.body;

    if (!checkIn || !checkOut) {
        return res.status(400).json({ success: false, message: "Check-in and check-out dates are required." });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
        return res.status(404).json({ success: false, message: "Listing not found." });
    }

    if (listing.owner && listing.owner.equals(req.session.userId)) {
        return res.status(400).json({ success: false, message: "You cannot book your own property." });
    }

    const isAvailable = await checkAvailability(listingId, checkIn, checkOut);
    if (!isAvailable) {
        return res.status(409).json({ success: false, message: "The selected dates are unavailable." });
    }

    const pricing = calculateBookingPrice(listing.price, checkIn, checkOut, Number(guests));

    if (!isRazorpayConfigured) {
        // Fallback for environment where Razorpay keys are not yet provided
        return res.json({
            success: true,
            mode: "demo",
            message: "Razorpay is in demo mode (credentials not configured in .env)."
        });
    }

    try {
        const order = await createRazorpayOrder({
            amount: pricing.totalPrice,
            currency: "INR",
            receipt: `rcpt_${listingId.toString().slice(-4)}_${Date.now().toString().slice(-6)}`,
            notes: {
                listingId,
                userId: req.session.userId.toString(),
                checkIn,
                checkOut,
                guests: String(guests)
            }
        });

        const currentUser = res.locals.currentUser || {};

        return res.json({
            success: true,
            mode: "razorpay",
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            listingTitle: listing.title,
            listingImage: listing.image && listing.image.url ? listing.image.url : "",
            totalPrice: pricing.totalPrice,
            user: {
                name: currentUser.name || "Traveler",
                email: currentUser.email || ""
            }
        });
    } catch (err) {
        console.error("[Razorpay Error] Failed to create order:", err);
        return res.status(500).json({ success: false, message: "Failed to initiate Razorpay order: " + err.message });
    }
};

/**
 * Verify Razorpay Payment Signature and finalize booking
 */
const verifyPayment = async (req, res) => {
    const { listingId } = req.params;
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        booking: bookingDetails
    } = req.body;

    if (!isRazorpayConfigured) {
        return res.status(400).json({ success: false, message: "Razorpay is not configured on the server." });
    }

    const isAuthentic = verifyPaymentSignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature
    });

    if (!isAuthentic) {
        return res.status(400).json({
            success: false,
            message: "Payment verification failed: Invalid cryptographic signature. Transaction cannot be validated."
        });
    }

    try {
        const booking = await createBooking({
            listingId,
            userId: req.session.userId,
            checkIn: bookingDetails.checkIn,
            checkOut: bookingDetails.checkOut,
            guests: Number(bookingDetails.guests),
            specialRequests: bookingDetails.specialRequests || "",
            payment: {
                method: "razorpay",
                status: "paid",
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                paidAt: new Date()
            }
        });

        req.flash("success", "Payment successful via Razorpay! Reservation confirmed. Have a wonderful trip!");
        return res.json({
            success: true,
            redirectUrl: "/bookings/my-trips",
            bookingId: booking._id
        });
    } catch (err) {
        console.error("[Booking Verification Error]:", err);
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to finalize booking after payment."
        });
    }
};

/**
 * Confirm and save booking (Standard / Direct / Fallback)
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
        specialRequests,
        payment: {
            method: "demo",
            status: "paid",
            paidAt: new Date()
        }
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
    createOrder,
    verifyPayment,
    postBooking,
    getGuestBookings,
    getHostReservations,
    cancelBooking,
    updateBookingStatus
};
