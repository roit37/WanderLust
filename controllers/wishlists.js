const User = require("../models/user");
const Listing = require("../models/listing");

const toggleWishlist = async (req, res) => {
    const { listingId } = req.params;
    const user = await User.findById(req.session.userId);

    if (!user) {
        if (req.xhr || req.headers.accept?.includes("json")) {
            return res.status(401).json({ success: false, message: "Please log in first" });
        }
        req.flash("error", "Please log in to save properties.");
        return res.redirect(`/listings/${listingId}`);
    }

    const listingIndex = user.wishlist.findIndex(
        (id) => id && id.toString() === listingId.toString()
    );
    let isAdded = false;

    if (listingIndex > -1) {
        user.wishlist.splice(listingIndex, 1);
        isAdded = false;
    } else {
        user.wishlist.push(listingId);
        isAdded = true;
    }

    await user.save();

    if (req.xhr || req.headers.accept?.includes("json")) {
        return res.json({ success: true, isAdded, wishlistCount: user.wishlist.length });
    }

    req.flash("success", isAdded ? "Added to your wishlist!" : "Removed from your wishlist.");
    const redirectUrl = req.get("Referrer") || `/listings/${listingId}`;
    res.redirect(redirectUrl);
};

const renderWishlist = async (req, res) => {
    const user = await User.findById(req.session.userId).populate({
        path: "wishlist",
        populate: {
            path: "owner",
            select: "name username"
        }
    });

    res.render("wishlists/index", {
        listings: user ? user.wishlist : []
    });
};

module.exports = {
    toggleWishlist,
    renderWishlist
};
