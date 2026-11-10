const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
    {
        listing: {
            type: Schema.Types.ObjectId,
            ref: "Listing",
            required: [true, "Listing reference is required"]
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"]
        },
        checkIn: {
            type: Date,
            required: [true, "Check-in date is required"]
        },
        checkOut: {
            type: Date,
            required: [true, "Check-out date is required"]
        },
        guests: {
            type: Number,
            required: [true, "Number of guests is required"],
            min: [1, "At least 1 guest required"]
        },
        nights: {
            type: Number,
            required: [true, "Number of nights is required"],
            min: [1, "Must be at least 1 night"]
        },
        pricePerNight: {
            type: Number,
            required: [true, "Price per night is required"],
            min: 0
        },
        cleaningFee: {
            type: Number,
            default: 500
        },
        serviceFee: {
            type: Number,
            default: 300
        },
        totalPrice: {
            type: Number,
            required: [true, "Total price is required"],
            min: 0
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "completed"],
            default: "confirmed"
        },
        specialRequests: {
            type: String,
            trim: true,
            default: ""
        },
        payment: {
            method: {
                type: String,
                enum: ["razorpay", "demo", "cash"],
                default: "razorpay"
            },
            status: {
                type: String,
                enum: ["pending", "paid", "failed", "refunded"],
                default: "paid"
            },
            razorpayOrderId: {
                type: String,
                default: null
            },
            razorpayPaymentId: {
                type: String,
                default: null
            },
            razorpaySignature: {
                type: String,
                default: null
            },
            paidAt: {
                type: Date,
                default: null
            }
        }
    },
    {
        timestamps: true
    }
);

// Indexes to rapidly query listing bookings and prevent overlapping confirmed bookings
bookingSchema.index({ listing: 1, status: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ user: 1, createdAt: -1 });

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
