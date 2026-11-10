/**
 * Calculate the number of nights between two dates.
 * Returns an integer >= 1.
 */
function calculateNights(checkInDate, checkOutDate) {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
}

/**
 * Check if two date ranges [startA, endA) and [startB, endB) overlap.
 * Overlap condition: startA < endB && endA > startB
 */
function isDateOverlap(startA, endA, startB, endB) {
    const aStart = new Date(startA).getTime();
    const aEnd = new Date(endA).getTime();
    const bStart = new Date(startB).getTime();
    const bEnd = new Date(endB).getTime();

    return aStart < bEnd && aEnd > bStart;
}

/**
 * Format a Date object to YYYY-MM-DD
 */
function formatDateInput(date) {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
}

module.exports = {
    calculateNights,
    isDateOverlap,
    formatDateInput
};
