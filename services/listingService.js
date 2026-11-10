const Listing = require("../models/listing");

async function queryListings(queryParams = {}) {
    const {
        q,
        category,
        minPrice,
        maxPrice,
        guests,
        sort = "newest",
        page = 1,
        limit = 12
    } = queryParams;

    const filter = {};

    // Search query by keywords in title, location, country, or description
    if (q && q.trim()) {
        const regex = new RegExp(q.trim(), "i");
        filter.$or = [
            { title: regex },
            { location: regex },
            { country: regex },
            { description: regex }
        ];
    }

    // Category filter
    if (category && category !== "All" && category.trim()) {
        filter.category = category.trim();
    }

    // Price range filter
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice && !isNaN(Number(minPrice))) {
            filter.price.$gte = Number(minPrice);
        }
        if (maxPrice && !isNaN(Number(maxPrice))) {
            filter.price.$lte = Number(maxPrice);
        }
    }

    // Guest capacity filter
    if (guests && !isNaN(Number(guests))) {
        filter.maxGuests = { $gte: Number(guests) };
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === "price_asc") {
        sortOptions = { price: 1 };
    } else if (sort === "price_desc") {
        sortOptions = { price: -1 };
    } else if (sort === "rating_desc") {
        sortOptions = { avgRating: -1, totalReviews: -1 };
    } else if (sort === "newest") {
        sortOptions = { createdAt: -1 };
    }

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
    const skip = (currentPage - 1) * pageLimit;

    const [listings, totalCount] = await Promise.all([
        Listing.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(pageLimit)
            .populate("owner", "name username avatar"),
        Listing.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / pageLimit) || 1;

    return {
        listings,
        totalCount,
        totalPages,
        currentPage,
        pageLimit,
        hasPrevPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
        filterParams: {
            q: q || "",
            category: category || "",
            minPrice: minPrice || "",
            maxPrice: maxPrice || "",
            guests: guests || "",
            sort: sort || "newest"
        }
    };
}

module.exports = {
    queryListings
};
