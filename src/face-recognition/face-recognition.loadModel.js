require('dotenv').config();
const tfjs = require('@tensorflow/tfjs-node');

const loadFRModel = () => {
    const modelUrl = "file://models/face-recognition/model.json";
    //const modelUrl = process.env.FACE_RECOGNITION_MODEL;
    return tfjs.loadLayersModel(modelUrl);
};

module.exports = {
    loadFRModel,
};