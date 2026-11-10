const sanitizeHtml = require("sanitize-html");

const cleanValue = (val) => {
    if (typeof val === "string") {
        return sanitizeHtml(val, {
            allowedTags: [],
            allowedAttributes: {}
        }).trim();
    }
    if (Array.isArray(val)) {
        return val.map(cleanValue);
    }
    if (val !== null && typeof val === "object") {
        const cleanedObj = {};
        for (const key of Object.keys(val)) {
            cleanedObj[key] = cleanValue(val[key]);
        }
        return cleanedObj;
    }
    return val;
};

const sanitizeInput = (req, res, next) => {
    if (req.body) {
        req.body = cleanValue(req.body);
    }
    if (req.query) {
        req.query = cleanValue(req.query);
    }
    next();
};

module.exports = sanitizeInput;
