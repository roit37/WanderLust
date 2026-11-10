const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
    {
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: [true, "Review comment is required"],
            trim: true
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        listing: {
            type: Schema.Types.ObjectId,
            ref: "Listing",
            required: true
        },
        verifiedBooking: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
