require("dotenv").config();
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const helmet = require("helmet");
const flash = require("connect-flash");

// Internal configurations & database
const connectDB = require("./config/db");
const createSessionConfig = require("./config/session");
const User = require("./models/user");

// Middlewares
const sanitizeInput = require("./middleware/sanitize");
const { generalLimiter } = require("./middleware/rateLimiter");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

// Routers
const listingRouter = require("./routes/listings");
const reviewRouter = require("./routes/reviews");
const bookingRouter = require("./routes/bookings");
const userRouter = require("./routes/users");
const dashboardRouter = require("./routes/dashboards");
const wishlistRouter = require("./routes/wishlists");

const app = express();

// Database Connection
connectDB().catch((err) => {
    console.error("[Fatal] Failed to connect to MongoDB:", err.message);
});

// View Engine Setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Security Headers (Helmet with customized CSP for CDNs & Media)
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://cdn.jsdelivr.net",
                    "https://checkout.razorpay.com"
                ],
                frameSrc: [
                    "'self'",
                    "https://api.razorpay.com",
                    "https://checkout.razorpay.com"
                ],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://cdn.jsdelivr.net",
                    "https://cdnjs.cloudflare.com",
                    "https://fonts.googleapis.com"
                ],
                fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
                imgSrc: [
                    "'self'",
                    "data:",
                    "blob:",
                    "https://images.unsplash.com",
                    "https://plus.unsplash.com",
                    "https://res.cloudinary.com",
                    "https://badges.razorpay.com"
                ],
                connectSrc: [
                    "'self'",
                    "https://api.razorpay.com",
                    "https://lumberjack.razorpay.com"
                ],
                upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null
            }
        },
        crossOriginEmbedderPolicy: false
    })
);

// General Rate Limiting
app.use(generalLimiter);

// Body Parsing & Sanitization
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(sanitizeInput);

// Method Override for RESTful PUT and DELETE requests
app.use(methodOverride("_method"));

// Static Assets
app.use(express.static(path.join(__dirname, "public")));

// Session & MongoStore
app.use(createSessionConfig());

// Flash Messages
app.use(flash());

// Current User & Global Template Locals Middleware
app.use(async (req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.info = req.flash("info");

    if (req.session && req.session.userId) {
        try {
            const user = await User.findById(req.session.userId).select("-password");
            res.locals.currentUser = user || null;
        } catch (err) {
            console.error("Error populating currentUser:", err);
            res.locals.currentUser = null;
        }
    } else {
        res.locals.currentUser = null;
    }
    next();
});

// Root Route - Redirects to listings explore page
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// Static Informational Pages
app.get("/privacy", (req, res) => res.render("pages/privacy"));
app.get("/terms", (req, res) => res.render("pages/terms"));
app.get("/sitemap", (req, res) => res.render("pages/sitemap"));
app.get("/company", (req, res) => res.render("pages/company"));
app.get(["/companydetails", "/company-details"], (req, res) => res.redirect("/company"));

// Mount Modular Routes
app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/bookings", bookingRouter);
app.use("/dashboard", dashboardRouter);
app.use("/wishlist", wishlistRouter);

// 404 Handler & Centralized Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

// Start server if run directly
const PORT = process.env.PORT || 8080;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`[WanderLust] Production server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
