const registerService = require('../register/register.service');
const Boom = require('@hapi/boom');

const registerHandler = async (request, h) => {
    try {
        const allowedParams = ['username', 'name', 'email', 'password', 'location', 'phone', 'role_id'];
        const payloadKeys = Object.keys(request.payload);
        const invalidParams = payloadKeys.filter(key => !allowedParams.includes(key));
        if (invalidParams.length > 0) {
            const boomError = Boom.badRequest(`/ ${invalidParams.join(', ')} / not allowed.`);
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true
            }).code(boomError.output.statusCode);
        }

        const { username, name, email, password, location, phone, role_id } = request.payload;
        if (!username || !name || !email || !password || !location || !phone || !role_id) {
            const boomError = Boom.badRequest('Please provide all required fields.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true
            }).code(boomError.output.statusCode);
        }

        const phoneRegex = /^(\+?\d{1,3})?(\d{8,15})$/;
        if (!phoneRegex.test(phone)) {
            const boomError = Boom.badRequest('Invalid phone number format, Please Use format +0123456789 or 08123456789.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true
            }).code(boomError.output.statusCode);
        }

        await registerService.registerUser(request.payload);
        return h.response({
            status: 201,
            message: 'User registered successfully',
            error: false
        }).code(201);

    } catch (error) {
        if (error.message.includes('already exists')) {
            const boomError = Boom.conflict(error.message);
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true
            }).code(boomError.output.statusCode);
        }

        const boomError = Boom.badRequest(error.message);
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true
        }).code(boomError.output.statusCode);
    }
};

module.exports = {
    registerHandler
};
