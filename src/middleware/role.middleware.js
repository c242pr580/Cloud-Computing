const Boom = require('@hapi/boom');

const verifyRole = (requiredRole) => {
    return (request, h) => {
        const { role } = request.auth.credentials;
        if (role != requiredRole) {
            throw Boom.forbidden('Access denied, Insufficient permissions.');
        }
        return h.continue;
    };
};

module.exports = { verifyRole };