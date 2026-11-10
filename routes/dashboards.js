const express = require("express");
const router = express.Router();
const dashboards = require("../controllers/dashboards");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isHost, isAdmin } = require("../middleware/auth");

router.get("/guest", isLoggedIn, catchAsync(dashboards.guestDashboard));
router.get("/host", isLoggedIn, isHost, catchAsync(dashboards.hostDashboard));
router.get("/admin", isAdmin, catchAsync(dashboards.adminDashboard));

// Admin user and listing controls
router.post("/admin/users/:userId/role", isAdmin, catchAsync(dashboards.adminUpdateUserRole));
router.post("/admin/users/:userId/delete", isAdmin, catchAsync(dashboards.adminDeleteUser));
router.post("/admin/listings/:listingId/delete", isAdmin, catchAsync(dashboards.adminDeleteListing));

module.exports = router;
