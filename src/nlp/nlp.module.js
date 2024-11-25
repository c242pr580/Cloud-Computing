const { vocab } = require('./vocab');
require('dotenv').config();
const tfjs = require('@tensorflow/tfjs-node');

const loadVocabulary = async () => {
    let vocabulary = [];
    try {
        const stringVocab = vocab;
        vocabulary = stringVocab.split('\n').map(word => word.trim());

        if (vocabulary[0] !== '') {
            vocabulary.unshift('');
        }

        vocabulary = [...new Set(vocabulary)];

        return vocabulary;
    } catch (error) {
        throw new Error('Failed to load vocabulary');
    }
}

const vectorizeText = (inputText, vocabulary, maxLength) => {
    if (vocabulary.length === 0) {
        throw new Error('Vocabulary kosong. Pastikan vocab berhasil dimuat.');
    }
    
    if (!inputText.trim()) {
        throw new Error('Input teks kosong atau tidak valid.');
    }
    
    const tokens = inputText
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/);

    const vector = tokens.map(token => {
        const index = vocabulary.indexOf(token);
        return index !== -1 ? index : vocabulary.indexOf('[UNK]');
    });

    const paddingLength = Math.max(0, maxLength - vector.length);
    const paddedVector = vector.concat(Array(paddingLength).fill(0));
    const finalVector = paddedVector.slice(0, maxLength);

    return finalVector;
}

const loadNLPModel = () => {
    class L2Regularizer {
        constructor(config) {
            this.l2 = config.l2;
        }

        apply(weights) {
            return tfjs.tidy(() => tfjs.mul(this.l2, tfjs.sum(tfjs.square(weights))));
        }

        static get className() {
            return 'L2';
        }
    }
    tfjs.serialization.registerClass(L2Regularizer);

    const modelUrl = process.env.NLP_MODEL;
    return tfjs.loadLayersModel(modelUrl);
};

module.exports = {
    loadVocabulary,
    vectorizeText,
    loadNLPModel
};