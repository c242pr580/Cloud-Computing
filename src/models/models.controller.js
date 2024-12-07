const Boom = require('@hapi/boom');
const modelsService = require('../models/models.service');
const customersModule = require('../customer/customers.module');
const FormData = require('form-data');
const axios = require('axios');

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
        if (validationResult == 'Legal') {
            resultMessage = 'Validate your jobs successfully'
        }
        else if (validationResult == 'Illegal') {
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

const uploadFaceHandler = async (request, h) => {
    if (!request.payload || Object.keys(request.payload).length === 0) {
        const boomError = Boom.badRequest('Request payload cannot be empty.');
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
    try {
        const { userId } = request.auth.credentials;

        const customer_id = await customersModule.findCustomerByUserId(userId);

        const allowedParams = ['verification_image'];
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

        const { verification_image } = request.payload;

        if (Array.isArray(verification_image)) {
            const boomError = Boom.badRequest('Only one image is allowed, Please remove any additional files and try again.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (!verification_image || !verification_image._data) {
            const boomError = Boom.badRequest('Please provide the customer image.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const data = {
            verification_image,
            customer_id: customer_id.customer_id,
        };

        const verificationResult = await modelsService.uploadFace(data);

        return h.response({
            status: 201,
            message: 'Model uploaded successfully',
            error: false,
        }).code(201);

    } catch (error) {
        const boomError = Boom.badImplementation(error.message);
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
};

const verifyFaceHandler = async (request, h) => {
    if (!request.payload || Object.keys(request.payload).length === 0) {
        const boomError = Boom.badRequest('Request payload cannot be empty.');
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
    try {
        const { userId } = request.auth.credentials;

        const customer_id = await customersModule.findCustomerByUserId(userId);

        const allowedParams = ['input_image'];
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

        const { input_image } = request.payload;

        if (Array.isArray(input_image)) {
            const boomError = Boom.badRequest('Only one image is allowed, Please remove any additional files and try again.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (!input_image || !input_image._data) {
            const boomError = Boom.badRequest('Please provide the customer image.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const data = {
            input_image,
            customer_id: customer_id.customer_id,
        };

        const predictResult = await modelsService.verifyFace(data);

        return h.response({
            status: 200,
            message: 'Model predicted successfully',
            data: predictResult,
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
    validateTitle,
    uploadFaceHandler,
    verifyFaceHandler
};
