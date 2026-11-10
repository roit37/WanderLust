const session = require("express-session");
const connectMongo = require("connect-mongo");
const MongoStore = connectMongo.default || connectMongo.MongoStore || connectMongo;

const createSessionConfig = () => {
    const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/wanderlust";
    const secret = process.env.SESSION_SECRET || "wanderlust_default_dev_session_secret_key";

    const store = MongoStore.create({
        mongoUrl: mongoURI,
        crypto: {
            secret: secret
        },
        touchAfter: 24 * 3600 // Update session once in 24 hrs unless data changes
    });

    store.on("error", (err) => {
        console.error("[Session Store] Error:", err);
    });

    return session({
        store,
        name: "wanderlust.sid",
        secret: secret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // true in production over HTTPS
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: "lax"
        }
    });
};

module.exports = createSessionConfig;
