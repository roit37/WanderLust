
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const { queryListings } = require("../services/listingService");
const ExpressError = require("../utils/ExpressError");

// Property categories
const categories = [
    { name: "All", icon: "fa-solid fa-house" },
    { name: "Beachfront", icon: "fa-solid fa-umbrella-beach" },
    { name: "Iconic Cities", icon: "fa-solid fa-city" },
    { name: "Mountains", icon: "fa-solid fa-mountain" },
    { name: "Castles", icon: "fa-solid fa-chess-rook" },
    { name: "Amazing Pools", icon: "fa-solid fa-person-swimming" },
    { name: "Camping", icon: "fa-solid fa-campground" },
    { name: "Farms", icon: "fa-solid fa-tractor" },
    { name: "Arctic", icon: "fa-solid fa-snowflake" },
    { name: "Domes", icon: "fa-solid fa-igloo" },
    { name: "Rooms", icon: "fa-solid fa-bed" },
    { name: "Luxury", icon: "fa-solid fa-gem" },
    { name: "Trending", icon: "fa-solid fa-fire" }
];

// INDEX: Display all listings with search and filters
const index = async (req, res) => {
    const result = await queryListings(req.query);

    const filters = result.filterParams || {
        q: req.query.q || "",
        category: req.query.category || "",
        minPrice: req.query.minPrice || "",
        maxPrice: req.query.maxPrice || "",
        guests: req.query.guests || ""
    };

    res.render("listings/index", {
        allListings: result.listings || [],
        cats: categories,
        activeCat: filters.category || "All",
        filters,
        pagination: {
            currentPage: result.currentPage || 1,
            totalPages: result.totalPages || 1,
            totalCount: result.totalCount || 0,
            hasNextPage: result.hasNextPage || false,
            hasPrevPage: result.hasPrevPage || false
        }
    });
};

// NEW: Render new listing form
const renderNewForm = (req, res) => {
    res.render("listings/new");
};

// CREATE: Create a new listing
const createListing = async (req, res) => {
    const listingData = { ...req.body.listing };

    listingData.owner = req.session.userId;

    // Handle image upload
    if (req.file) {
        const imageUrl = req.file.path
            ? (req.file.path.startsWith("http")
                ? req.file.path
                : `/uploads/${req.file.filename}`)
            : `/uploads/${req.file.filename}`;

        listingData.image = {
            url: imageUrl,
            filename: req.file.filename || "listingimage"
        };
    } else if (
        typeof listingData.image === "string" &&
        listingData.image.trim()
    ) {
        listingData.image = {
            url: listingData.image.trim(),
            filename: "custom_url_image"
        };
    } else if (!listingData.image || !listingData.image.url) {
        listingData.image = {
            url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60",
            filename: "default_listing_image"
        };
    }

    // Process amenities
    if (typeof listingData.amenities === "string") {
        listingData.amenities = listingData.amenities
            .split(",")
            .map(a => a.trim())
            .filter(Boolean);
    }

    const newListing = new Listing(listingData);
    await newListing.save();

    req.flash("success", "New property listing successfully created!");

    res.redirect(`/listings/${newListing._id}`);
};

// SHOW: Display individual listing
const showListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
                select: "name username avatar"
            }
        })
        .populate("owner", "name username email avatar bio role");

    if (!listing) {
        req.flash("error", "The listing you are looking for does not exist.");
        return res.redirect("/listings");
    }

    let hasVerifiedStay = false;

    if (req.session.userId) {
        const userBooking = await Booking.findOne({
            listing: id,
            user: req.session.userId,
            status: { $in: ["confirmed", "completed"] }
        });

        hasVerifiedStay = Boolean(userBooking);
    }

    let isInWishlist = false;

    if (res.locals.currentUser?.wishlist) {
        isInWishlist = res.locals.currentUser.wishlist.some(
            item => item.toString() === listing._id.toString()
        );
    }

    res.render("listings/show", {
        listing,
        hasVerifiedStay,
        isInWishlist
    });
};

// EDIT: Render edit form
const renderEditForm = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    const amenitiesString = (listing.amenities || []).join(", ");

    res.render("listings/edit", {
        listing,
        amenitiesString
    });
};

// UPDATE: Update existing listing
const updateListing = async (req, res) => {
    const { id } = req.params;

    const updateData = { ...req.body.listing };

    // Process amenities
    if (typeof updateData.amenities === "string") {
        updateData.amenities = updateData.amenities
            .split(",")
            .map(a => a.trim())
            .filter(Boolean);
    }

    // Handle uploaded or manually entered image
    if (req.file) {
        const imageUrl = req.file.path
            ? (req.file.path.startsWith("http")
                ? req.file.path
                : `/uploads/${req.file.filename}`)
            : `/uploads/${req.file.filename}`;

        updateData.image = {
            url: imageUrl,
            filename: req.file.filename || "listingimage"
        };
    } else if (
        typeof updateData.image === "string" &&
        updateData.image.trim()
    ) {
        updateData.image = {
            url: updateData.image.trim(),
            filename: "custom_url_image"
        };
    } else {
        delete updateData.image;
    }

    const listing = await Listing.findByIdAndUpdate(
        id,
        updateData,
        {
            runValidators: true,
            returnDocument: "after"
        }
    );

    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    req.flash("success", "Property listing updated successfully!");

    res.redirect(`/listings/${listing._id}`);
};

// DELETE: Delete listing
const deleteListing = async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findByIdAndDelete(id);

    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    req.flash("success", "Property listing removed.");

    res.redirect("/listings");
};

module.exports = {
    index,
    renderNewForm,
    createListing,
    showListing,
    renderEditForm,
    updateListing,
    deleteListing
};
