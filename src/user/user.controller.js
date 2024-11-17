const userService = require('../user/user.service');
const Boom = require('@hapi/boom');
const { uploadFileToCloudStorage } = require('../server/storage');

const getUserBiodataHandler = async (request, h) => {
    try {
        const { userId, role } = request.auth.credentials;
        const biodata = await userService.getUserBiodata(userId);

        if (role == 1) {
            biodata.role_id = 'Customer';
        } else if (role == 2) {
            biodata.role_id = 'Mitra';
        }

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

const updateUserBiodataHandler = async (request, h) => {
    try {
        const { userId } = request.auth.credentials;
        const { location, name, phone } = request.payload;
        const allowedParams = ['location', 'name', 'phone', 'image'];
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

        if (Array.isArray(request.payload.image)) {
            const boomError = Boom.badRequest('Only one image is allowed, Please remove any additional files and try again.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const existingUserData = await userService.getUserBiodata(userId);
        if (!existingUserData) {
            const boomError = Boom.notFound('User not found, Please ensure the user exists and try again.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        let publicUrl = existingUserData.profilePicture;
        if (request.payload.image) {
            const file = request.payload.image;
            const fileName = `${userId}-${Date.now()}-${file.hapi.filename}`;

            if (!['image/jpeg', 'image/png'].includes(file.hapi.headers['content-type'])) {
                const boomError = Boom.unsupportedMediaType('File type must be JPEG or PNG.');
                return h.response({
                    status: boomError.output.statusCode,
                    message: boomError.message,
                    error: true,
                }).code(boomError.output.statusCode);
            }

            if (file.bytes > 1 * 1024 * 1024) {
                const boomError = Boom.payloadTooLarge('File size must not exceed 1MB.');
                return h.response({
                    status: boomError.output.statusCode,
                    message: boomError.message,
                    error: true,
                }).code(boomError.output.statusCode);
            }

            publicUrl = await uploadFileToCloudStorage(file, fileName, file.hapi.headers['content-type']);
        }

        const updatedData = {
            location: location || existingUserData.location,
            name: name || existingUserData.name,
            phone: phone || existingUserData.phone,
            profilePicture: publicUrl,
        };

        await userService.updateUserBiodata(userId, updatedData);

        return h.response({
            status: 200,
            message: 'User biodata updated successfully',
            error: false,
        }).code(200);
    } catch (error) {
        const boomError = Boom.badImplementation(error.message);
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
};

module.exports = {
    getUserBiodataHandler,
    updateUserBiodataHandler
};
