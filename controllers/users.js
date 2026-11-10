const User = require("../models/user");
const ExpressError = require("../utils/ExpressError");

const renderRegisterForm = (req, res) => {
    res.render("users/register");
};

const register = async (req, res) => {
    const { name, username, email, password, role = "guest" } = req.body;

    // Check if user already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
        req.flash("error", "An account with that email already exists.");
        return res.redirect("/register");
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase().trim() });
    if (existingUsername) {
        req.flash("error", "That username is already taken. Please choose another.");
        return res.redirect("/register");
    }

    const user = new User({
        name: name.trim(),
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password: password, // Pre-save hook hashes this with bcrypt
        role: ["guest", "host"].includes(role) ? role : "guest"
    });

    await user.save();

    // Log the user in directly via session
    req.session.userId = user._id;

    req.flash("success", `Welcome to WanderLust, ${user.name}!`);
    res.redirect("/listings");
};

const renderLoginForm = (req, res) => {
    res.render("users/login");
};

const login = async (req, res) => {
    const { usernameOrEmail, password } = req.body;
    const identifier = usernameOrEmail.toLowerCase().trim();

    const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }]
    });

    if (!user) {
        req.flash("error", "Invalid username/email or password.");
        return res.redirect("/login");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        req.flash("error", "Invalid username/email or password.");
        return res.redirect("/login");
    }

    // Set session
    req.session.userId = user._id;

    const redirectUrl = req.session.returnTo || "/listings";
    delete req.session.returnTo;

    req.flash("success", `Welcome back, ${user.name}!`);
    res.redirect(redirectUrl);
};

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Session destroy error:", err);
        }
        res.clearCookie("wanderlust.sid");
        res.redirect("/listings");
    });
};

const renderProfile = async (req, res) => {
    const user = await User.findById(req.session.userId);
    if (!user) {
        req.flash("error", "User not found.");
        return res.redirect("/login");
    }
    res.render("users/profile", { user });
};

const updateProfile = async (req, res) => {
    const { name, bio, role } = req.body;
    const user = await User.findById(req.session.userId);

    if (!user) {
        req.flash("error", "User not found.");
        return res.redirect("/login");
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();

    // Allow user to upgrade role to host
    if (role && ["guest", "host"].includes(role)) {
        user.role = role;
    }

    await user.save();

    req.flash("success", "Profile updated successfully!");
    res.redirect("/profile");
};

module.exports = {
    renderRegisterForm,
    register,
    renderLoginForm,
    login,
    logout,
    renderProfile,
    updateProfile
};
