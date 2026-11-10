const { describe, it, before, after } = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/user");
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const Review = require("../models/review");

// Unique prefix for test run
const TEST_TIMESTAMP = Date.now();

describe("WanderLust Full Integration Test Suite", () => {
    let hostCookie = "";
    let guestCookie = "";
    let adminCookie = "";
    let testListingId = "";
    let testBookingId = "";
    let testReviewId = "";

    const testAdminData = {
        name: "Test Admin",
        username: `test_admin_${TEST_TIMESTAMP}`,
        email: `admin_${TEST_TIMESTAMP}@test.com`,
        password: "Password@123",
        role: "admin"
    };

    const testHostData = {
        name: "Test Host",
        username: `test_host_${TEST_TIMESTAMP}`,
        email: `host_${TEST_TIMESTAMP}@test.com`,
        password: "Password@123",
        role: "host"
    };

    const testGuestData = {
        name: "Test Guest",
        username: `test_guest_${TEST_TIMESTAMP}`,
        email: `guest_${TEST_TIMESTAMP}@test.com`,
        password: "Password@123",
        role: "guest"
    };

    before(async () => {
        // Ensure database connection
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wanderlust");
        }
    });

    after(async () => {
        // Cleanup created test records
        try {
            await User.deleteMany({ email: { $regex: TEST_TIMESTAMP.toString() } });
            if (testListingId) {
                await Listing.findByIdAndDelete(testListingId);
            }
            if (testBookingId) {
                await Booking.findByIdAndDelete(testBookingId);
            }
            if (testReviewId) {
                await Review.findByIdAndDelete(testReviewId);
            }
        } catch (e) {
            console.error("Cleanup error:", e);
        }
    });

    // ==========================================
    // 1. PUBLIC ROUTES & BROWSING
    // ==========================================
    describe("Public Routes & Navigation", () => {
        it("GET / should redirect to /listings", async () => {
            const res = await request(app).get("/");
            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.header.location, "/listings");
        });

        it("GET /listings should return status 200 with property cards", async () => {
            const res = await request(app).get("/listings");
            assert.strictEqual(res.status, 200);
            assert.match(res.text, /WanderLust/);
        });

        it("GET /login and GET /register should be accessible to guests", async () => {
            const loginRes = await request(app).get("/login");
            assert.strictEqual(loginRes.status, 200);
            assert.match(loginRes.text, /Welcome Back/);

            const regRes = await request(app).get("/register");
            assert.strictEqual(regRes.status, 200);
            assert.match(regRes.text, /Create an Account/);
        });

        it("GET /sitemap and GET /company should return status 200", async () => {
            const sitemapRes = await request(app).get("/sitemap");
            assert.strictEqual(sitemapRes.status, 200);
            assert.match(sitemapRes.text, /WanderLust Sitemap/);

            const companyRes = await request(app).get("/company");
            assert.strictEqual(companyRes.status, 200);
            assert.match(companyRes.text, /Company Details/);

            const companyDetailsRedirect = await request(app).get("/companydetails");
            assert.strictEqual(companyDetailsRedirect.status, 302);
            assert.strictEqual(companyDetailsRedirect.header.location, "/company");
        });
    });

    // ==========================================
    // 2. USER REGISTRATION & AUTHENTICATION
    // ==========================================
    describe("Authentication & Role Authorization", () => {
        it("should register a new host user", async () => {
            const res = await request(app)
                .post("/register")
                .send(testHostData);

            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.header.location, "/listings");
        });

        it("should prevent duplicate registration with existing email", async () => {
            const res = await request(app)
                .post("/register")
                .send(testHostData);

            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.header.location, "/register");
        });

        it("should register a new guest user", async () => {
            const res = await request(app)
                .post("/register")
                .send(testGuestData);

            assert.strictEqual(res.status, 302);
        });

        it("should create an admin user directly and allow login", async () => {
            const admin = new User(testAdminData);
            await admin.save();

            const res = await request(app)
                .post("/login")
                .send({
                    usernameOrEmail: testAdminData.email,
                    password: testAdminData.password
                });

            assert.strictEqual(res.status, 302);
            adminCookie = res.header["set-cookie"];
            assert.ok(adminCookie, "Admin should receive session cookie");
        });

        it("should login host user successfully and retain session", async () => {
            const res = await request(app)
                .post("/login")
                .send({
                    usernameOrEmail: testHostData.email,
                    password: testHostData.password
                });

            assert.strictEqual(res.status, 302);
            hostCookie = res.header["set-cookie"];
            assert.ok(hostCookie, "Host should receive session cookie");
        });

        it("should login guest user successfully and retain session", async () => {
            const res = await request(app)
                .post("/login")
                .send({
                    usernameOrEmail: testGuestData.email,
                    password: testGuestData.password
                });

            assert.strictEqual(res.status, 302);
            guestCookie = res.header["set-cookie"];
            assert.ok(guestCookie, "Guest should receive session cookie");
        });

        it("should reject login with wrong password", async () => {
            const res = await request(app)
                .post("/login")
                .send({
                    usernameOrEmail: testGuestData.email,
                    password: "IncorrectPassword!"
                });

            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.header.location, "/login");
        });
    });

    // ==========================================
    // 3. PROPERTY MANAGEMENT & AUTHORIZATION
    // ==========================================
    describe("Property Management & CRUD", () => {
        it("should block unauthenticated user from creating a listing", async () => {
            const res = await request(app)
                .post("/listings")
                .send({
                    listing: {
                        title: "Unauthorized Villa",
                        description: "Should fail because not logged in",
                        price: 5000,
                        location: "Nice",
                        country: "France"
                    }
                });

            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.header.location, "/login");
        });

        it("should block guest from creating a listing (host role required)", async () => {
            const res = await request(app)
                .post("/listings")
                .set("Cookie", guestCookie)
                .send({
                    listing: {
                        title: "Guest Villa",
                        description: "Should fail because user is guest",
                        price: 5000,
                        location: "Nice",
                        country: "France"
                    }
                });

            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.header.location, "/dashboard/guest");
        });

        it("should allow host to create a new property listing", async () => {
            const res = await request(app)
                .post("/listings")
                .set("Cookie", hostCookie)
                .send({
                    listing: {
                        title: `Spectacular Oceanfront Haven ${TEST_TIMESTAMP}`,
                        description: "A luxury private oceanfront estate with private infinity pool and stunning coastal views.",
                        category: "Beachfront",
                        price: 2500,
                        location: "Goa Beach",
                        country: "India",
                        maxGuests: 6,
                        bedrooms: 3,
                        bathrooms: 3,
                        amenities: ["Wifi", "Pool", "Kitchen", "Free parking", "Air conditioning"]
                    }
                });

            assert.strictEqual(res.status, 302);
            const redirectUrl = res.header.location;
            assert.match(redirectUrl, /\/listings\/[a-f0-9]{24}/);
            testListingId = redirectUrl.split("/listings/")[1];
            assert.ok(testListingId, "Created listing should have an ObjectId");
        });

        it("GET /listings/:id should display the created listing details", async () => {
            const res = await request(app).get(`/listings/${testListingId}`);
            assert.strictEqual(res.status, 200);
            assert.match(res.text, new RegExp(TEST_TIMESTAMP.toString()));
            assert.match(res.text, /Goa Beach/);
        });

        it("should reject another user from modifying the listing", async () => {
            const res = await request(app)
                .put(`/listings/${testListingId}`)
                .set("Cookie", guestCookie)
                .send({
                    listing: {
                        title: "Hacked Title",
                        description: "Attempted unauthorized edit",
                        price: 100,
                        location: "Nowhere",
                        country: "Nowhere"
                    }
                });

            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.header.location, `/listings/${testListingId}`);
        });

        it("should allow the listing owner to update listing details", async () => {
            const updatedTitle = `Spectacular Oceanfront Haven UPDATED ${TEST_TIMESTAMP}`;
            const res = await request(app)
                .put(`/listings/${testListingId}`)
                .set("Cookie", hostCookie)
                .send({
                    listing: {
                        title: updatedTitle,
                        description: "Updated description with new amenities and extended balcony.",
                        price: 2800,
                        location: "Goa Beach",
                        country: "India",
                        category: "Beachfront"
                    }
                });

            assert.strictEqual(res.status, 302);
            const updatedDoc = await Listing.findById(testListingId);
            assert.strictEqual(updatedDoc.title, updatedTitle);
            assert.strictEqual(updatedDoc.price, 2800);
        });
    });

    // ==========================================
    // 4. SEARCH & FILTERING
    // ==========================================
    describe("Search, Filter & Querying", () => {
        it("should filter listings by location query", async () => {
            const res = await request(app).get("/listings?q=Goa");
            assert.strictEqual(res.status, 200);
            assert.match(res.text, /Goa Beach/);
        });

        it("should filter listings by category", async () => {
            const res = await request(app).get("/listings?category=Beachfront");
            assert.strictEqual(res.status, 200);
            assert.match(res.text, /Beachfront/);
        });
    });

    // ==========================================
    // 5. BOOKING SYSTEM & CONFLICT PREVENTION
    // ==========================================
    describe("Booking Engine & Double-Booking Prevention", () => {
        const checkIn = new Date();
        checkIn.setDate(checkIn.getDate() + 20);
        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + 3);

        const checkInStr = checkIn.toISOString().split("T")[0];
        const checkOutStr = checkOut.toISOString().split("T")[0];

        it("should allow guest to preview checkout breakdown", async () => {
            const res = await request(app)
                .get(`/bookings/checkout/${testListingId}?checkIn=${checkInStr}&checkOut=${checkOutStr}&guests=2`)
                .set("Cookie", guestCookie);

            assert.strictEqual(res.status, 200);
            assert.match(res.text, /Price details/);
            assert.match(res.text, /3 nights/);
        });

        it("should successfully create a verified booking for guest", async () => {
            const res = await request(app)
                .post(`/bookings/create/${testListingId}`)
                .set("Cookie", guestCookie)
                .send({
                    booking: {
                        checkIn: checkInStr,
                        checkOut: checkOutStr,
                        guests: 2,
                        specialRequests: "Window view requested"
                    }
                });

            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.header.location, "/bookings/my-trips");

            const booking = await Booking.findOne({ listing: testListingId, status: "confirmed" });
            assert.ok(booking, "Confirmed booking should exist in database");
            assert.strictEqual(booking.nights, 3);
            testBookingId = booking._id.toString();
        });

        it("should PREVENT overlapping double booking on the same property and dates", async () => {
            const res = await request(app)
                .post(`/bookings/create/${testListingId}`)
                .set("Cookie", guestCookie)
                .send({
                    booking: {
                        checkIn: checkInStr,
                        checkOut: checkOutStr,
                        guests: 2
                    }
                });

            // Error handler catches 409 conflict
            assert.strictEqual(res.status, 409);
            assert.match(res.text, /already booked or unavailable/);
        });

        it("should prevent a host from booking their own property", async () => {
            const futureIn = new Date();
            futureIn.setDate(futureIn.getDate() + 40);
            const futureOut = new Date(futureIn);
            futureOut.setDate(futureOut.getDate() + 2);

            const res = await request(app)
                .post(`/bookings/create/${testListingId}`)
                .set("Cookie", hostCookie)
                .send({
                    booking: {
                        checkIn: futureIn.toISOString().split("T")[0],
                        checkOut: futureOut.toISOString().split("T")[0],
                        guests: 1
                    }
                });

            assert.strictEqual(res.status, 400);
            assert.match(res.text, /cannot book your own property/);
        });

        it("should allow guest to view their bookings at /bookings/my-trips", async () => {
            const res = await request(app)
                .get("/bookings/my-trips")
                .set("Cookie", guestCookie);

            assert.strictEqual(res.status, 200);
            assert.match(res.text, /Trips & Reservations/);
            assert.match(res.text, /confirmed/i);
        });

        it("should allow host to view incoming reservations at /bookings/host-reservations", async () => {
            const res = await request(app)
                .get("/bookings/host-reservations")
                .set("Cookie", hostCookie);

            assert.strictEqual(res.status, 200);
            assert.match(res.text, /Host Reservations Management/);
        });
    });

    // ==========================================
    // 6. REVIEWS & RATINGS SYSTEM
    // ==========================================
    describe("Reviews & Verified Stays", () => {
        it("should allow guest to post a review and verify stay", async () => {
            const res = await request(app)
                .post(`/listings/${testListingId}/reviews`)
                .set("Cookie", guestCookie)
                .send({
                    review: {
                        rating: 5,
                        comment: "Truly paradise! The ocean views were surreal and everything was pristine."
                    }
                });

            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.header.location, `/listings/${testListingId}`);

            const listing = await Listing.findById(testListingId).populate("reviews");
            assert.strictEqual(listing.totalReviews, 1);
            assert.strictEqual(listing.avgRating, 5.0);

            const rev = listing.reviews[0];
            testReviewId = rev._id.toString();
            assert.strictEqual(rev.verifiedBooking, true, "Review should receive verified booking badge");
        });

        it("should block non-author from deleting the review", async () => {
            const res = await request(app)
                .delete(`/listings/${testListingId}/reviews/${testReviewId}`)
                .set("Cookie", hostCookie); // Host is not author of this review

            assert.strictEqual(res.status, 302);
            const rev = await Review.findById(testReviewId);
            assert.ok(rev, "Review should still exist");
        });

        it("should allow review author to delete their review", async () => {
            const res = await request(app)
                .delete(`/listings/${testListingId}/reviews/${testReviewId}`)
                .set("Cookie", guestCookie);

            assert.strictEqual(res.status, 302);
            const listing = await Listing.findById(testListingId);
            assert.strictEqual(listing.totalReviews, 0);
            assert.strictEqual(listing.avgRating, 0);
        });
    });

    // ==========================================
    // 7. WISHLIST
    // ==========================================
    describe("Wishlists", () => {
        it("should allow logged-in user to toggle a property in their wishlist", async () => {
            const res = await request(app)
                .post(`/wishlist/toggle/${testListingId}`)
                .set("Cookie", guestCookie);

            assert.strictEqual(res.status, 302);
            const user = await User.findOne({ email: testGuestData.email });
            assert.ok(user.wishlist.some((id) => id.toString() === testListingId));
        });

        it("GET /wishlist should show saved properties", async () => {
            const res = await request(app)
                .get("/wishlist")
                .set("Cookie", guestCookie);

            assert.strictEqual(res.status, 200);
            assert.match(res.text, /Your Wishlist/);
        });
    });

    // ==========================================
    // 8. DASHBOARDS & ADMIN CONTROLS
    // ==========================================
    describe("Dashboards & Admin Administration", () => {
        it("should allow guest to view /dashboard/guest", async () => {
            const res = await request(app)
                .get("/dashboard/guest")
                .set("Cookie", guestCookie);

            assert.strictEqual(res.status, 200);
            assert.match(res.text, /Upcoming Trips/);
        });

        it("should allow host to view /dashboard/host", async () => {
            const res = await request(app)
                .get("/dashboard/host")
                .set("Cookie", hostCookie);

            assert.strictEqual(res.status, 200);
            assert.match(res.text, /Host Operations Dashboard/);
        });

        it("should block non-admin from accessing /dashboard/admin", async () => {
            const res = await request(app)
                .get("/dashboard/admin")
                .set("Cookie", guestCookie);

            assert.strictEqual(res.status, 302);
            assert.strictEqual(res.header.location, "/listings");
        });

        it("should allow admin to access /dashboard/admin", async () => {
            const res = await request(app)
                .get("/dashboard/admin")
                .set("Cookie", adminCookie);

            assert.strictEqual(res.status, 200);
            assert.match(res.text, /Platform Administration/);
            assert.match(res.text, /Super Admin Mode/);
        });
    });
});
