const tfjs = require('@tensorflow/tfjs-node');
const { loadVocabulary, vectorizeText } = require('./nlp.module');

async function predict(model, title) {
    try {
        const vocabulary = await loadVocabulary();
        const maxLength = 20;
        const inputArray = vectorizeText(title, vocabulary, maxLength);
        const tensorInput = tfjs.tensor2d([inputArray], [1, maxLength]);
        const prediction = model.predict(tensorInput);
        const result = await prediction.data();
        const threshold = 0.5;
        const label = result[0] >= threshold ? "Legal" : "Illegal";
        return label;
    } catch (error) {
        throw new Error("Failed to predict.");
    }
}

module.exports = {
    predict,
};