// helpers.js
// Utility helper functions
export function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
}