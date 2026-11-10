const User = require("../models/user");
const Listing = require("../models/listing");
const Booking = require("../models/booking");

const guestDashboard = async (req, res) => {
    const user = await User.findById(req.session.userId).populate("wishlist");
    const bookings = await Booking.find({ user: req.session.userId })
        .populate("listing")
        .sort({ checkIn: -1 });

    const today = new Date();
    const upcomingTrips = bookings.filter((b) => new Date(b.checkIn) >= today && b.status !== "cancelled");
    const pastTrips = bookings.filter((b) => new Date(b.checkIn) < today && b.status !== "cancelled");

    res.render("dashboards/guest", {
        user,
        upcomingTrips,
        pastTrips,
        totalBookings: bookings.length,
        wishlistCount: user.wishlist ? user.wishlist.length : 0
    });
};

const hostDashboard = async (req, res) => {
    const myListings = await Listing.find({ owner: req.session.userId }).sort({ createdAt: -1 });
    const listingIds = myListings.map((l) => l._id);

    const reservations = await Booking.find({ listing: { $in: listingIds } })
        .populate("listing")
        .populate("user", "name username email avatar")
        .sort({ createdAt: -1 });

    const totalRevenue = reservations
        .filter((r) => r.status === "confirmed" || r.status === "completed")
        .reduce((sum, r) => sum + (r.totalPrice - r.serviceFee), 0);

    const activeReservations = reservations.filter((r) => r.status === "confirmed").length;

    res.render("dashboards/host", {
        listings: myListings,
        reservations,
        totalListings: myListings.length,
        totalReservations: reservations.length,
        activeReservations,
        totalRevenue
    });
};

const adminDashboard = async (req, res) => {
    const [users, listings, bookings] = await Promise.all([
        User.find().sort({ createdAt: -1 }),
        Listing.find().populate("owner", "name username email").sort({ createdAt: -1 }),
        Booking.find()
            .populate("listing", "title location")
            .populate("user", "name username email")
            .sort({ createdAt: -1 })
    ]);

    const platformVolume = bookings
        .filter((b) => b.status === "confirmed" || b.status === "completed")
        .reduce((sum, b) => sum + b.totalPrice, 0);

    res.render("dashboards/admin", {
        users,
        listings,
        bookings,
        totalUsers: users.length,
        totalListings: listings.length,
        totalBookings: bookings.length,
        platformVolume
    });
};

const adminUpdateUserRole = async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["guest", "host", "admin"].includes(role)) {
        req.flash("error", "Invalid user role specified.");
        return res.redirect("/dashboard/admin");
    }

    if (userId === req.session.userId.toString() && role !== "admin") {
        req.flash("error", "You cannot demote yourself from admin role.");
        return res.redirect("/dashboard/admin");
    }

    await User.findByIdAndUpdate(userId, { role });
    req.flash("success", "User role successfully updated.");
    res.redirect("/dashboard/admin");
};

const adminDeleteUser = async (req, res) => {
    const { userId } = req.params;

    if (userId === req.session.userId.toString()) {
        req.flash("error", "You cannot delete your own admin account.");
        return res.redirect("/dashboard/admin");
    }

    await User.findByIdAndDelete(userId);
    req.flash("success", "User account removed.");
    res.redirect("/dashboard/admin");
};

const adminDeleteListing = async (req, res) => {
    const { listingId } = req.params;
    await Listing.findByIdAndDelete(listingId);
    req.flash("success", "Listing successfully removed by administrator.");
    res.redirect("/dashboard/admin");
};

module.exports = {
    guestDashboard,
    hostDashboard,
    adminDashboard,
    adminUpdateUserRole,
    adminDeleteUser,
    adminDeleteListing
};
