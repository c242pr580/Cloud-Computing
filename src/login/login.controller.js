const loginService = require('./login.service');
const Boom = require('@hapi/boom');

const loginHandler = async (request, h) => {
    try {
        const { email, password } = request.payload;
        if (!email || !password) {
            const boomError = Boom.badRequest('Please provide all required fields.');
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
        const boomError = Boom.unauthorized(error.message);
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true
        }).code(boomError.output.statusCode);
    }
};

module.exports = { loginHandler };
