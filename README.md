# WanderLust 🌍 | Vacation Rental & Booking Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express Version](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20%2F%20Mongoose-brightgreen.svg)](https://mongoosejs.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-28%20Passed-success.svg)](https://nodejs.org/api/test.html)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

**WanderLust** is an Airbnb-inspired vacation rental marketplace built with **Node.js, Express 5, MongoDB, Mongoose, and EJS**. Designed with a production-grade **MVC (Model-View-Controller) architecture**, it delivers an intuitive user experience for travelers, hosts, and platform administrators, complete with real-time booking calculations, verified review badges, role-based authorization, rate limiting, and automated integration testing.

---

## 🌟 Key Highlights & Engineering Features

### 1. Robust MVC Architecture
- Modular separation into `config/`, `controllers/`, `models/`, `routes/`, `middleware/`, `services/`, `validators/`, `utils/`, and `views/`.
- Strict CommonJS standard with async/await patterns and unified error propagation via `catchAsync` and custom `ExpressError`.

### 2. Multi-Role Authentication & Access Control
- **User Roles**: `Guest`, `Host`, and `Admin`.
- **Password Security**: Passwords salted and hashed with `bcryptjs`.
- **Persistent Sessions**: Backed by `connect-mongo` MongoStore with HTTP-only, secure cookies.
- **Role Middleware**:
  - `isLoggedIn` & `isLoggedOut` guards with automatic redirection and destination recovery (`returnTo`).
  - `isListingOwner` for property updates and deletions.
  - `isReviewAuthor` for review deletions.
  - `isBookingParty` ensuring only the guest, the property host, or an admin can manage a booking.
  - `isAdmin` guarding platform metrics, user moderation, and property enforcement.

### 3. Property Management & Search Engine
- **Property Schema**: Title, description, cover image, category, nightly price, location, country, guest capacity, bedrooms, bathrooms, and customizable amenities.
- **Image Pipeline**: Integrated with **Cloudinary** via `multer-storage-cloudinary`, featuring an automatic local/URL fallback mechanism when external cloud credentials are omitted.
- **Search & Filters**:
  - Keyword search matching title, location, country, or description.
  - Filter by category (*Beachfront, Mountains, Iconic Cities, Castles, Amazing Pools, Camping, Domes, Rooms, Luxury, etc.*).
  - Price range filter (*Min Price & Max Price*).
  - Guest capacity filtering.
  - Sorting by newest, price (low-to-high, high-to-low), and top customer ratings.
  - Server-side pagination with dynamic page controls.

### 4. Conflict-Free Booking Engine
- **Overlapping Availability Check**: Queries existing confirmed and pending reservations to prevent double-bookings.
- **Server-Side Price Calculation**:
  - Automatically calculates stay duration in nights.
  - Applies fixed cleaning fee (₹500) and service fee (5%).
  - Prevents hosts from booking their own spaces.
- **Client-Side Live Preview**: Instant client-side updates of night count and total cost on the property detail page when dates are selected.
- **Status Lifecycle**: `pending` → `confirmed` → `completed` / `cancelled`.

### 5. Verified Reviews & Star Ratings
- 1 to 5 star rating submission with written feedback.
- **Verified Guest Badge**: Cross-references booking history so travelers who completed stays at the property receive a "Verified Stay" badge on their review.
- Dynamic recalculation of average ratings (`avgRating`) and total review counts on creation and deletion.
- Cascade deletion: Removing a property automatically purges all associated reviews via Mongoose post-delete hooks.

### 6. User Wishlists & Multi-Tier Dashboards
- **Guest Dashboard**: Profile view, upcoming trip counters, saved wishlist, trip histories, and 1-click upgrade to Host.
- **Host Dashboard**: Property performance overview, gross payout statistics, listed properties management, and incoming guest reservations with status actions.
- **Admin Panel**: Platform KPIs (Users, Listings, Bookings, Platform Volume), user role modification, user deletion, and content moderation.

### 7. Hardened Security & Performance
- **Helmet**: Customized Content Security Policy (CSP) whitelisting Bootstrap CDN, FontAwesome, Google Fonts, and image CDNs (Unsplash, Cloudinary).
- **Rate Limiting**: `express-rate-limit` protecting against brute-force authentication and general DDoS attempts.
- **XSS Protection**: HTML sanitization on body payloads via `sanitize-html`.
- **Method Override**: Enables RESTful `PUT` and `DELETE` requests from HTML forms.
- **Custom 404 & 500 Pages**: Clean error rendering with informative developer stack traces in development mode.

---

## 🏗️ Directory Structure

```text
MAJORPROJECT/
├── config/
│   ├── db.js                 # MongoDB connection handler
│   ├── cloudinary.js         # Cloudinary & multer storage with fallback
│   └── session.js            # Express session & MongoStore configuration
├── controllers/
│   ├── listings.js           # Property CRUD, image uploads, search
│   ├── bookings.js           # Reservation lifecycle, guest & host trips
│   ├── reviews.js            # Review CRUD & verified stay verification
│   ├── users.js              # Register, login, logout, profile update
│   ├── dashboards.js         # Guest, Host, and Admin dashboard views
│   └── wishlists.js          # User saved properties toggle
├── middleware/
│   ├── auth.js               # isLoggedIn, isHost, isAdmin, isOwner, etc.
│   ├── validate.js           # Joi schema validation middleware
│   ├── sanitize.js           # Input sanitization against XSS
│   ├── rateLimiter.js        # Express rate limiters
│   └── errorHandler.js       # 404 and global error handler
├── models/
│   ├── user.js               # User schema with bcrypt hashing & wishlist
│   ├── listing.js            # Property schema with cascade delete hook
│   ├── booking.js            # Booking schema with indexed overlap checks
│   └── review.js             # Review schema with verifiedBooking flag
├── routes/
│   ├── listings.js           # /listings endpoints
│   ├── reviews.js            # /listings/:id/reviews endpoints
│   ├── bookings.js           # /bookings endpoints
│   ├── users.js              # /register, /login, /logout, /profile
│   ├── dashboards.js         # /dashboard/guest, /host, /admin
│   └── wishlists.js          # /wishlist endpoints
├── services/
│   ├── bookingService.js     # Overlap checking & price calculation
│   └── listingService.js     # Query builder, filters & pagination
├── utils/
│   ├── ExpressError.js       # Custom operational error class
│   ├── catchAsync.js         # Async error wrapper
│   └── dateUtils.js          # Date overlap and night difference utilities
├── validators/
│   └── schemas.js            # Joi validation schemas
├── views/
│   ├── layouts/boilerplate.ejs
│   ├── includes/navbar.ejs, footer.ejs, flash.ejs
│   ├── listings/index.ejs, show.ejs, new.ejs, edit.ejs, home.ejs
│   ├── bookings/checkout.ejs, guestBookings.ejs, hostReservations.ejs
│   ├── dashboards/guest.ejs, host.ejs, admin.ejs
│   ├── users/register.ejs, login.ejs, profile.ejs
│   ├── wishlists/index.ejs
│   ├── pages/privacy.ejs, terms.ejs
│   └── errors/error.ejs
├── public/
│   ├── css/style.css         # Modern styling & responsive design
│   └── js/main.js            # Real-time booking calculator & validation
├── init/
│   ├── data.js               # Sample categorized properties
│   └── index.js              # Database seed script
├── tests/
│   └── app.test.js           # 28 Integration test cases
├── .env.example              # Environment variable documentation
├── .gitignore                # Production ignore patterns
├── app.js                    # Server entrypoint
└── package.json
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance running at `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 1. Clone & Install Dependencies
```bash
cd MAJORPROJECT
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure `.env` contains valid configuration:
```env
PORT=8080
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/wanderlust
SESSION_SECRET=your_secure_random_session_secret_string

# Cloudinary (Optional: omit to use local disk storage / direct image URLs)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Seed Credentials
ADMIN_NAME=Platform Administrator
ADMIN_EMAIL=admin@wanderlust.com
ADMIN_PASSWORD=Admin@123456
ADMIN_USERNAME=admin
HOST_EMAIL=host@wanderlust.com
HOST_PASSWORD=Host@123456
GUEST_EMAIL=guest@wanderlust.com
GUEST_PASSWORD=Guest@123456
```

### 3. Seed Database with Demo Data
Populate the database with categorized listings, demo accounts, sample verified reviews, and bookings:
```bash
npm run seed
```

### 4. Start the Application
```bash
npm start
```
Open your browser and navigate to **`http://localhost:8080`**.

---

## 🔑 Pre-Configured Demo Accounts

For instant testing and presentation, the seed script sets up three pre-configured accounts:

| Role | Email | Password | Username |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@wanderlust.com` | `Admin@123456` | `admin` |
| **Host** | `host@wanderlust.com` | `Host@123456` | `sarah_superhost` |
| **Guest** | `guest@wanderlust.com` | `Guest@123456` | `alex_traveler` |

> 💡 **Tip**: The login page (`/login`) includes **1-Click Demo Login** buttons to automatically sign in as any of the roles above without typing credentials.

---

## 🧪 Automated Testing

WanderLust features an end-to-end integration test suite built with Node's native test runner (`node:test`) and `supertest`.

To execute the test suite:
```bash
npm test
```

### Test Coverage (28 Passing Tests):
- **Public Routes & Navigation**: Root redirects, listing catalog rendering, public pages.
- **Authentication**: Registration, duplicate prevention, password hashing, valid/invalid logins, session retention.
- **Property Management**: Unauthenticated creation block, guest role block, host creation, ownership modification protection, owner updates.
- **Search & Filter**: Keyword search, category filtering, capacity verification.
- **Booking Engine**: Checkout preview, valid reservation creation, **conflict rejection on identical dates**, self-booking prevention, guest and host trip lists.
- **Reviews**: Verified stay flag validation, rating calculation, unauthorized deletion prevention, author deletion.
- **Wishlist**: Toggle favorites, view saved properties.
- **Dashboards & Admin**: Guest dashboard, host dashboard, non-admin restriction, admin access.

---

## 🚀 Deployment Instructions

### Deploying to Cloud Providers (e.g., Render, Railway, Heroku)

1. **Set up MongoDB Atlas**:
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
   - Create a database user and whitelist network access (`0.0.0.0/0`).
   - Copy your connection string (`mongodb+srv://...`).

2. **Configure Cloud Environment Variables**:
   Set the following variables in your hosting provider's dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `8080` (or provider's default `$PORT`)
   - `MONGODB_URI`: `<Your MongoDB Atlas connection URI>`
   - `SESSION_SECRET`: `<A long cryptographically random string>`
   - `CLOUDINARY_CLOUD_NAME`: `<Your Cloudinary cloud name>`
   - `CLOUDINARY_API_KEY`: `<Your Cloudinary API key>`
   - `CLOUDINARY_API_SECRET`: `<Your Cloudinary API secret>`

3. **Build & Start Commands**:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - (Optional) **Release / Pre-deploy Command**: `npm run seed` to seed initial data.

---

## 🛡️ License

This project is licensed under the ISC License. Free to use for educational, demonstration, and personal portfolio purposes.
