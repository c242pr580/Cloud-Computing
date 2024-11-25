const Hapi = require('@hapi/hapi');
const { loadFRModel } = require('../face-recognition/face-recognition.loadModel');
const { loadNLPModel } = require('../nlp/nlp.loadModel');
const faceRecognitionRoutes = require('../routes/face-recognition.route');

(async () => {
    console.log('model loaded!');
    const server = Hapi.server({
        host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
        port: 3000
    });

    const frmodel = await loadFRModel();
    const nlpmodel = await loadNLPModel();

    server.app.frmodel = frmodel;
    server.app.nlpmodel = nlpmodel;
    server.route(faceRecognitionRoutes);

    await server.start();

    console.log(`Server start at: ${server.info.uri}`);
    process.on('unhandledRejection', (err) => {
        console.log(err);
        process.exit(1);
    });
})();