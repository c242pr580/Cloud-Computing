const { predict } = require('./face-recognition.inference');

const faceRecognitionHandler = async (request) => {
    const { image } = request.payload;
    const { frmodel } = request.server.app;
    const predictions = await predict(frmodel, image);
    return { result: predictions};
};

module.exports = {
    faceRecognitionHandler,
};