const Joi = require("joi");

const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().trim().min(3).max(120).required().messages({
            "string.empty": "Listing title cannot be empty",
            "string.min": "Title must be at least 3 characters",
            "any.required": "Title is required"
        }),
        description: Joi.string().trim().min(10).required().messages({
            "string.empty": "Description cannot be empty",
            "string.min": "Description must be at least 10 characters",
            "any.required": "Description is required"
        }),
        price: Joi.number().min(0).required().messages({
            "number.base": "Price must be a valid number",
            "number.min": "Price cannot be negative",
            "any.required": "Price is required"
        }),
        location: Joi.string().trim().required().messages({
            "string.empty": "Location is required",
            "any.required": "Location is required"
        }),
        country: Joi.string().trim().required().messages({
            "string.empty": "Country is required",
            "any.required": "Country is required"
        }),
        category: Joi.string().valid(
            "Trending",
            "Beachfront",
            "Rooms",
            "Iconic Cities",
            "Mountains",
            "Castles",
            "Amazing Pools",
            "Camping",
            "Farms",
            "Arctic",
            "Domes",
            "Boats",
            "Luxury"
        ).default("Trending"),
        amenities: Joi.alternatives().try(
            Joi.array().items(Joi.string()),
            Joi.string().allow("")
        ),
        maxGuests: Joi.number().integer().min(1).default(2),
        bedrooms: Joi.number().integer().min(1).default(1),
        bathrooms: Joi.number().integer().min(1).default(1),
        image: Joi.alternatives().try(
            Joi.string().allow(""),
            Joi.object({
                url: Joi.string().allow(""),
                filename: Joi.string().allow("")
            })
        )
    }).required()
});

const reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().integer().min(1).max(5).required().messages({
            "number.base": "Rating must be a number between 1 and 5",
            "number.min": "Rating must be at least 1 star",
            "number.max": "Rating cannot exceed 5 stars",
            "any.required": "Rating is required"
        }),
        comment: Joi.string().trim().min(3).required().messages({
            "string.empty": "Review comment cannot be empty",
            "string.min": "Comment must be at least 3 characters long",
            "any.required": "Review comment is required"
        })
    }).required()
});

const bookingSchema = Joi.object({
    booking: Joi.object({
        checkIn: Joi.date().iso().required().messages({
            "date.base": "Valid check-in date is required",
            "any.required": "Check-in date is required"
        }),
        checkOut: Joi.date().iso().greater(Joi.ref("checkIn")).required().messages({
            "date.base": "Valid check-out date is required",
            "date.greater": "Check-out date must be strictly after check-in date",
            "any.required": "Check-out date is required"
        }),
        guests: Joi.number().integer().min(1).required().messages({
            "number.min": "At least 1 guest is required",
            "any.required": "Number of guests is required"
        }),
        specialRequests: Joi.string().allow("").max(500)
    }).required()
});

const userRegisterSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required().messages({
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters"
    }),
    username: Joi.string().pattern(/^[a-zA-Z0-9_]{3,30}$/).lowercase().required().messages({
        "string.empty": "Username is required",
        "string.pattern.base": "Username must only contain letters, numbers, and underscores",
        "string.min": "Username must be at least 3 characters"
    }),
    email: Joi.string().email().lowercase().trim().required().messages({
        "string.email": "Please provide a valid email address",
        "string.empty": "Email is required"
    }),
    password: Joi.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters long",
        "string.empty": "Password is required"
    }),
    role: Joi.string().valid("guest", "host").default("guest")
});

const userLoginSchema = Joi.object({
    usernameOrEmail: Joi.string().trim().required().messages({
        "string.empty": "Username or Email is required"
    }),
    password: Joi.string().required().messages({
        "string.empty": "Password is required"
    })
});

module.exports = {
    listingSchema,
    reviewSchema,
    bookingSchema,
    userRegisterSchema,
    userLoginSchema
};
