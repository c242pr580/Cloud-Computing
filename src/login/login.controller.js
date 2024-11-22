const loginService = require('../login/login.service');
const Boom = require('@hapi/boom');

const loginHandler = async (request, h) => {
    try {
        const { email, password } = request.payload;
        const allowedParams = ['email', 'password'];
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

        if (!email || !password) {
            const boomError = Boom.badRequest('Please provide all required fields.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true
            }).code(boomError.output.statusCode);
        }

        if (password.length < 8) {
            const boomError = Boom.badRequest('Password must be at least 8 characters.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true
            }).code(boomError.output.statusCode);
        }
           
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email)) {
            const boomError = Boom.badRequest('The email format is invalid, Please enter a valid email address.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true
            }).code(boomError.output.statusCode);
        }

        const response = await loginService.loginUser(request.payload);
        return h.response({
            status: 200,
            message: 'Login successfully',
            data: response,
            error: false
        }).code(200);
    } catch (error) {
        const boomError = Boom.badRequest(error.message);
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true
        }).code(boomError.output.statusCode);
    }
};

module.exports = { loginHandler };
