//const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const validate = async (decoded, request, h) => {
    if (!JWT_SECRET) {
        throw new Error("Missing JWT_SECRET in environment variables.");
    }
    if (decoded && decoded.userId) {
        return { isValid: true, credentials: decoded };
    }
    return { isValid: false };
};

module.exports = validate;
