const mongoose = require("mongoose");

const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wanderlust";
    try {
        const conn = await mongoose.connect(mongoURI);
        console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
        return conn;
    } catch (err) {
        console.error(`[MongoDB] Connection error: ${err.message}`);
        throw err;
    }
};

module.exports = connectDB;
