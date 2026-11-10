const Razorpay = require("razorpay");
const crypto = require("crypto");

const isRazorpayConfigured = Boolean(
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_KEY_ID !== "your_razorpay_key_id"
);

let razorpayInstance = null;

if (isRazorpayConfigured) {
    razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
}

/**
 * Create a new Razorpay Order
 * @param {Object} options - { amount (in INR), currency, receipt, notes }
 * @returns {Promise<Object>} Razorpay Order Object
 */
async function createRazorpayOrder({ amount, currency = "INR", receipt, notes = {} }) {
    if (!isRazorpayConfigured || !razorpayInstance) {
        throw new Error("Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are not configured.");
    }

    // Razorpay expects the amount in the smallest currency sub-unit (paise for INR, i.e., amount * 100)
    const amountInPaise = Math.round(Number(amount) * 100);

    const orderOptions = {
        amount: amountInPaise,
        currency: currency.toUpperCase(),
        receipt: receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        notes: notes
    };

    return await razorpayInstance.orders.create(orderOptions);
}

/**
 * Cryptographically verify Razorpay payment signature
 * @param {Object} params - { orderId, paymentId, signature }
 * @returns {boolean} Whether signature is authentic
 */
function verifyPaymentSignature({ orderId, paymentId, signature }) {
    if (!isRazorpayConfigured) return false;
    if (!orderId || !paymentId || !signature) return false;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

    return expectedSignature === signature;
}

module.exports = {
    isRazorpayConfigured,
    razorpayInstance,
    createRazorpayOrder,
    verifyPaymentSignature
};
