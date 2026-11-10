const ExpressError = require("../utils/ExpressError");

// 404 Not Found Catch-All
const notFoundHandler = (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
};

// Global Error Handler
const errorHandler = (err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;

    // Handle Mongoose invalid ObjectId CastError
    if (err.name === "CastError") {
        statusCode = 400;
        message = `Resource not found with invalid identifier: ${err.value}`;
    }

    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map((val) => val.message).join(", ");
    }

    // Handle MongoDB duplicate key error (11000)
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `A record with that ${field} already exists.`;
    }

    if (process.env.NODE_ENV !== "test" && statusCode === 500) {
        console.error("[ServerError]", err);
    }

    res.status(statusCode).render("errors/error", {
        statusCode,
        message,
        stack: process.env.NODE_ENV === "development" ? err.stack : null
    });
};

module.exports = {
    notFoundHandler,
    errorHandler
};
