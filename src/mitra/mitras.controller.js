const Boom = require('@hapi/boom');
const mitrasService = require('../mitra/mitras.service');

const updateMitraDataHandler = async (request, h) => {
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

        const mitra = await mitrasService.getMitraByUserId(userId);

        const { business_name, business_address } = request.payload;

        const allowedParams = ['business_name', 'business_address'];
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

        await mitrasService.updateMitraData(mitra.mitra_id, {
            business_name: business_name || mitra.business_name,
            business_address: business_address || mitra.business_address,
            transaction_done: mitra.transaction_done || '0',
            rating: mitra.rating || '0',
        });

        return h.response({
            status: 200,
            message: 'Mitra data updated successfully',
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

const getMitraDetailByIdHandler = async (request, h) => {
    try {
        const { mitraId } = request.params;
        const mitra = await mitrasService.getMitraById(mitraId);

        if (!mitra) {
            const boomError = Boom.notFound('Mitra profile not found, Please try again.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const mitraDetail = {
            mitra_id: mitra.mitra_id,
            business_name: mitra.business_name,
            business_address: mitra.business_address,
            transaction_done: mitra.transaction_done,
            rating: mitra.rating
        };

        return h.response({
            status: 200,
            message: 'Mitra details retrieved successfully',
            data: mitraDetail,
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
    updateMitraDataHandler,
    getMitraDetailByIdHandler
};
