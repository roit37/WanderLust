const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true
        },
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        role: {
            type: String,
            enum: ["guest", "host", "admin"],
            default: "guest"
        },
        avatar: {
            url: {
                type: String,
                default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"
            },
            filename: {
                type: String,
                default: "default_avatar"
            }
        },
        bio: {
            type: String,
            default: "Travel enthusiast & WanderLust member"
        },
        wishlist: [
            {
                type: Schema.Types.ObjectId,
                ref: "Listing"
            }
        ]
    },
    {
        timestamps: true
    }
);

// Hash password before saving if modified
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
