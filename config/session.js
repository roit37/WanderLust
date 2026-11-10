
const session = require("express-session");
const connectMongo = require("connect-mongo");

const MongoStore =
    connectMongo.default || connectMongo.MongoStore || connectMongo;

const createSessionConfig = () => {
    const mongoURI =
        process.env.ATLASDB_URL ||
        process.env.MONGODB_URI ||
        (process.env.NODE_ENV !== "production"
            ? "mongodb://127.0.0.1:27017/wanderlust"
            : null);

    const secret = process.env.SESSION_SECRET;

    if (!mongoURI) {
        throw new Error("MongoDB session connection string is missing!");
    }

    if (!secret) {
        throw new Error("SESSION_SECRET is missing!");
    }

    const store = MongoStore.create({
        mongoUrl: mongoURI,
        crypto: {
            secret: secret
        },
        touchAfter: 24 * 3600
    });

    store.on("error", (err) => {
        console.error("[Session Store] Error:", err);
    });

    return session({
        store,
        name: "wanderlust.sid",
        secret,
        resave: false,
        saveUninitialized: false,
        proxy: process.env.NODE_ENV === "production",
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: "lax"
        }
    });
};

module.exports = createSessionConfig;
