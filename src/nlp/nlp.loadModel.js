require('dotenv').config();
const tfjs = require('@tensorflow/tfjs-node');

const loadNLPModel = () => {
    const modelUrl = "file://models/nlp/model.json";
    //const modelUrl = process.env.NLP_MODEL;
    return tfjs.loadLayersModel(modelUrl);
};

module.exports = {
    loadNLPModel,
};