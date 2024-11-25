const { predict } = require('./nlp.inference');
const Boom = require('@hapi/boom');

const NLPHandler = async (request, h) => {
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
            const boomError = Boom.badRequest('No title provided.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true
            }).code(boomError.output.statusCode);
        }


        const { nlpmodel } = request.server.app;
        const prediction = await predict(nlpmodel, title);

        return h.response({
            status: 200,
            message: 'Model predicted successfully',
            data: prediction,
            error: false,
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

module.exports = {
    NLPHandler,
};