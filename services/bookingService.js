const Booking = require("../models/booking");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError");
const { calculateNights } = require("../utils/dateUtils");

/**
 * Verifies if a listing is available for the given check-in and check-out dates.
 * Excludes an optional bookingId (useful when rescheduling an existing booking).
 */
async function checkAvailability(listingId, checkIn, checkOut, excludeBookingId = null) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new ExpressError(400, "Invalid date format.");
    }

    if (end <= start) {
        throw new ExpressError(400, "Check-out date must be strictly after check-in date.");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
        throw new ExpressError(400, "Check-in date cannot be in the past.");
    }

    const query = {
        listing: listingId,
        status: { $in: ["confirmed", "pending"] },
        $or: [
            // Overlapping date conditions
            { checkIn: { $lt: end }, checkOut: { $gt: start } }
        ]
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    const conflictingBooking = await Booking.findOne(query);
    return !conflictingBooking;
}

/**
 * Calculates pricing details for a prospective booking.
 */
function calculateBookingPrice(pricePerNight, checkIn, checkOut, guests) {
    const nights = calculateNights(checkIn, checkOut);
    if (nights < 1) {
        throw new ExpressError(400, "A booking must be for at least 1 night.");
    }

    const accommodationPrice = pricePerNight * nights;
    const cleaningFee = 500;
    const serviceFee = Math.round(accommodationPrice * 0.05); // 5% service fee
    const totalPrice = accommodationPrice + cleaningFee + serviceFee;

    return {
        nights,
        pricePerNight,
        accommodationPrice,
        cleaningFee,
        serviceFee,
        totalPrice
    };
}

/**
 * Creates a verified booking with overlap protection.
 */
async function createBooking({ listingId, userId, checkIn, checkOut, guests, specialRequests = "", payment = null }) {
    const listing = await Listing.findById(listingId);
    if (!listing) {
        throw new ExpressError(404, "Listing not found.");
    }

    if (listing.owner && listing.owner.equals(userId)) {
        throw new ExpressError(400, "You cannot book your own property.");
    }

    if (guests > (listing.maxGuests || 10)) {
        throw new ExpressError(400, `This listing accommodates a maximum of ${listing.maxGuests || 10} guests.`);
    }

    const isAvailable = await checkAvailability(listingId, checkIn, checkOut);
    if (!isAvailable) {
        throw new ExpressError(409, "The selected dates are already booked or unavailable. Please choose different dates.");
    }

    const pricing = calculateBookingPrice(listing.price, checkIn, checkOut, guests);

    const paymentData = payment || {
        method: "demo",
        status: "paid",
        paidAt: new Date()
    };

    const booking = new Booking({
        listing: listingId,
        user: userId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests,
        nights: pricing.nights,
        pricePerNight: pricing.pricePerNight,
        cleaningFee: pricing.cleaningFee,
        serviceFee: pricing.serviceFee,
        totalPrice: pricing.totalPrice,
        status: "confirmed",
        specialRequests,
        payment: paymentData
    });

    await booking.save();
    return booking;
}

module.exports = {
    checkAvailability,
    calculateBookingPrice,
    createBooking
};
