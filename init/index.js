require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const User = require("../models/user");
const Review = require("../models/review");
const Booking = require("../models/booking");
const initData = require("./data");

const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(mongoURI);
    console.log("[Seed] Connected to MongoDB at:", mongoURI);
}

const seedDB = async () => {
    try {
        await main();

        // 1. Clear existing collections
        console.log("[Seed] Cleaning existing data...");
        await Review.deleteMany({});
        await Booking.deleteMany({});
        await Listing.deleteMany({});
        await User.deleteMany({});

        // 2. Seed Default Users
        console.log("[Seed] Creating default users (Admin, Host, Guest)...");

        const admin = new User({
            name: process.env.ADMIN_NAME || "Platform Administrator",
            email: (process.env.ADMIN_EMAIL || "admin@wanderlust.com").toLowerCase(),
            username: (process.env.ADMIN_USERNAME || "admin").toLowerCase(),
            password: process.env.ADMIN_PASSWORD || "Admin@123456",
            role: "admin",
            bio: "WanderLust Global Administrator"
        });
        await admin.save();

        const host = new User({
            name: "Sarah Jenkins",
            email: (process.env.HOST_EMAIL || "host@wanderlust.com").toLowerCase(),
            username: "sarah_superhost",
            password: process.env.HOST_PASSWORD || "Host@123456",
            role: "host",
            bio: "Passionate Superhost welcoming travelers from all over the globe for over 6 years."
        });
        await host.save();

        const guest = new User({
            name: "Alexander Reed",
            email: (process.env.GUEST_EMAIL || "guest@wanderlust.com").toLowerCase(),
            username: "alex_traveler",
            password: process.env.GUEST_PASSWORD || "Guest@123456",
            role: "guest",
            bio: "Solo digital nomad exploring scenic cabins and coastal stays."
        });
        await guest.save();

        console.log("[Seed] Users created successfully.");

        // 3. Seed Listings linked to Host
        console.log("[Seed] Inserting sample property listings...");
        const listingsToInsert = initData.data.map((listing) => ({
            ...listing,
            owner: host._id,
            reviews: [],
            avgRating: 0,
            totalReviews: 0
        }));

        const insertedListings = await Listing.insertMany(listingsToInsert);
        console.log(`[Seed] Inserted ${insertedListings.length} listings.`);

        // 4. Seed a Sample Booking for the Guest on the first listing
        const firstListing = insertedListings[0];
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 10);
        const checkOut = new Date(nextMonth);
        checkOut.setDate(checkOut.getDate() + 4);

        const sampleBooking = new Booking({
            listing: firstListing._id,
            user: guest._id,
            checkIn: nextMonth,
            checkOut: checkOut,
            guests: 2,
            nights: 4,
            pricePerNight: firstListing.price,
            cleaningFee: 500,
            serviceFee: Math.round(firstListing.price * 4 * 0.05),
            totalPrice: firstListing.price * 4 + 500 + Math.round(firstListing.price * 4 * 0.05),
            status: "confirmed",
            specialRequests: "Early check-in around 1 PM if possible."
        });
        await sampleBooking.save();

        // 5. Seed Verified Reviews on first two listings
        const review1 = new Review({
            rating: 5,
            comment: "Absolutely breathtaking location! Waking up to the ocean breeze and waves was unforgettable. Spotlessly clean and Sarah is a phenomenal host.",
            author: guest._id,
            listing: firstListing._id,
            verifiedBooking: true
        });
        await review1.save();

        firstListing.reviews.push(review1._id);
        firstListing.totalReviews = 1;
        firstListing.avgRating = 5.0;
        await firstListing.save();

        const secondListing = insertedListings[1];
        const review2 = new Review({
            rating: 4,
            comment: "Stylish downtown loft with super fast wifi. Perfect for remote work and steps away from subway stations.",
            author: guest._id,
            listing: secondListing._id,
            verifiedBooking: false
        });
        await review2.save();

        secondListing.reviews.push(review2._id);
        secondListing.totalReviews = 1;
        secondListing.avgRating = 4.0;
        await secondListing.save();

        // Add first listing to guest's wishlist
        guest.wishlist.push(firstListing._id);
        guest.wishlist.push(secondListing._id);
        await guest.save();

        console.log("[Seed] Database successfully populated with initial data!");
        console.log("------------------------------------------------------------");
        console.log("Demo Accounts:");
        console.log("  Admin: admin@wanderlust.com / Admin@123456 (username: admin)");
        console.log("  Host:  host@wanderlust.com  / Host@123456  (username: sarah_superhost)");
        console.log("  Guest: guest@wanderlust.com / Guest@123456 (username: alex_traveler)");
        console.log("------------------------------------------------------------");

        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error("[Seed] Error initializing database:", err);
        process.exit(1);
    }
};

if (require.main === module) {
    seedDB();
}

module.exports = seedDB;
