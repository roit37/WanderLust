const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const listingSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Listing title is required"],
            trim: true
        },
        description: {
            type: String,
            required: [true, "Listing description is required"],
            trim: true
        },
        image: {
            filename: {
                type: String,
                default: "listingimage"
            },
            url: {
                type: String,
                default: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60"
            }
        },
        images: [
            {
                filename: String,
                url: String
            }
        ],
        price: {
            type: Number,
            required: [true, "Listing price is required"],
            min: [0, "Price cannot be negative"]
        },
        location: {
            type: String,
            required: [true, "Listing location is required"],
            trim: true
        },
        country: {
            type: String,
            required: [true, "Listing country is required"],
            trim: true
        },
        category: {
            type: String,
            enum: [
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
            ],
            default: "Trending"
        },
        amenities: {
            type: [String],
            default: ["Wifi", "Kitchen", "Free parking", "Air conditioning"]
        },
        maxGuests: {
            type: Number,
            default: 2,
            min: 1
        },
        bedrooms: {
            type: Number,
            default: 1,
            min: 1
        },
        bathrooms: {
            type: Number,
            default: 1,
            min: 1
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        reviews: [
            {
                type: Schema.Types.ObjectId,
                ref: "Review"
            }
        ],
        avgRating: {
            type: Number,
            default: 0
        },
        totalReviews: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Cascade delete associated reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing && listing.reviews && listing.reviews.length > 0) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
