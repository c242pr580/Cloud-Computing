const { predict } = require('./nlp.inference');

const NLPHandler = async (request) => {
    const { title } = request.payload;
    const { nlpmodel } = request.server.app;
    const predictions = await predict(nlpmodel, title);
    return { result: predictions};
};

module.exports = {
    NLPHandler,
};