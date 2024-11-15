const userService = require('../user/user.service');
const Boom = require('@hapi/boom');

const getUserBiodataHandler = async (request, h) => {
    try {
        const { userId, role } = request.auth.credentials;
        const biodata = await userService.getUserBiodata(userId);

        return h.response({
            status: 200,
            message: 'User biodata retrieved successfully',
            data: biodata,
            error: false,
        }).code(200);
    } catch (error) {
        const boomError = Boom.notFound(error.message);
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
};

module.exports = { getUserBiodataHandler };
