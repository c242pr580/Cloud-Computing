const jwt = require('jsonwebtoken');
const Boom = require('@hapi/boom');

const validate = async (artifacts, request, h) => {
    try {
        console.log(artifacts);

        if (!process.env.JWT_SECRET) {
            console.error("Missing Jwt Secret in environment variables.");
            return { isValid: false, credentials: null };
        }

        const decoded = artifacts.decoded.payload;

        if (!decoded) {
            console.warn("No decoded payload provided.");
            return { isValid: false, credentials: null };
        }

        if (!decoded.userId) {
            console.warn("No userId found in decoded token.");
            return { isValid: false, credentials: null };
        }

        return { 
            isValid: true, 
            credentials: {
                userId: decoded.userId,
                role: decoded.role
            } 
        };

    } catch (error) {
        console.error(error);
        return { isValid: false, credentials: null };
    }
};

module.exports = validate;