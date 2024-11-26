require('dotenv').config();
const Hapi = require('@hapi/hapi');
const { loadNLPModel } = require('../nlp/nlp.module');
const NLPRoutes = require('../routes/nlp.route');

(async () => {
    const server = Hapi.server({
        host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
        port: process.env.PORT
    });

    try {
        const nlpmodel = await loadNLPModel();
        server.app.nlpmodel = nlpmodel;
    } catch (error) {
        throw new Error('Failed to load model.');
    }

    server.route(NLPRoutes);

    server.route({
        method: '*',
        path: '/{any*}',
        handler: (request, h) => {
            return 'Page not found.';
        }
    });

    await server.start();

    console.log(`Server start at: ${server.info.uri}`);
    process.on('unhandledRejection', (err) => {
        console.log(err);
        process.exit(1);
    });
})();