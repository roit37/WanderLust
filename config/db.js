
const mongoose = require("mongoose");

const connectDB = async () => {
    const mongoURI =
        process.env.ATLASDB_URL ||
        process.env.MONGODB_URI ||
        (process.env.NODE_ENV !== "production"
            ? "mongodb://127.0.0.1:27017/wanderlust"
            : null);

    if (!mongoURI) {
        throw new Error("MongoDB connection string is missing!");
    }

    try {
        const conn = await mongoose.connect(mongoURI);

        console.log(
            `[MongoDB] Connected successfully: ${conn.connection.host}`
        );

        return conn;
    } catch (err) {
        console.error(`[MongoDB] Connection error: ${err.message}`);
        throw err;
    }
};

module.exports = connectDB;
