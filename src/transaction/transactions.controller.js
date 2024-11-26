const transactionsService = require('../transaction/transactions.service');
const Boom = require('@hapi/boom');

const createPaymentHandler = async (request, h) => {
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
        const { job_id } = request.payload;

        const allowedParams = ['job_id'];
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

        if (!job_id) {
            const boomError = Boom.badRequest('Please provide all required fields.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true
            }).code(boomError.output.statusCode);
        }

        const paymentResult = await transactionsService.createPayment(userId, job_id);

        return h.response({
            status: 201,
            message: 'Payment link created successfully',
            data: paymentResult,
            error: false,
        }).code(201);
    } catch (error) {
        const boomError = Boom.badRequest(error.message);
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
};

const handlePaymentNotification = async (request, h) => {
    try {
        const notification = request.payload;

        const notificationResult = await transactionsService.processPaymentNotification(notification);

        return h.response({
            status: 200,
            message: 'Transaction processed successfully',
            data: notificationResult,
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
    createPaymentHandler,
    handlePaymentNotification
};