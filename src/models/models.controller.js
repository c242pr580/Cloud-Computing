const Boom = require('@hapi/boom');
const modelsService = require('../models/models.service');

const validateTitle = async (request, h) => {
    if (!request.payload || Object.keys(request.payload).length === 0) {
        const boomError = Boom.badRequest('Request payload cannot be empty.');
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
    try {
        const allowedParams = ['title'];
        const payloadKeys = Object.keys(request.payload);
        const invalidParams = payloadKeys.filter((key) => !allowedParams.includes(key));

        if (invalidParams.length > 0) {
            const boomError = Boom.badRequest(`/ ${invalidParams.join(', ')} / not allowed.`);
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }
        const { title } = request.payload;

        if (!title) {
            return h.response({
                status: 400,
                message: 'Please provide all required fields',
                error: true,
            }).code(400);
        }
        const validationResult = await modelsService.validateTitle(title);

        let resultMessage = '';
        if (validationResult == 'Legal'){
            resultMessage = 'Validate your jobs successfully'
        }
        else if (validationResult == 'Illegal'){
            resultMessage = 'Your jobs not be posted, Please change your title jobs.'
        }
        return h.response({
            status: 200,
            message: resultMessage,
            result: validationResult,
            error: false,
        }).code(200);

    } catch (error) {
        const boomError = Boom.badRequest(error.message);
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
};

module.exports = {
    validateTitle,
};
