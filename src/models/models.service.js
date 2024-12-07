const modelModule = require('../models/models.module');
const axios = require('axios');

const validateTitle = async (title) => {
    try {
        const apiResponse = await modelModule.modelapiNlp({ title });

        if (apiResponse.status == 200) {
            return apiResponse.data;
        } else {
            throw new Error('Failed to get a response, Please try again.');
        }
    } catch (error) {
        throw new Error(error.message);
    }
};

const uploadFace = async (data) => {
    try {
        const apiResponse = await modelModule.uploadFaceRecognition(data);

        if (apiResponse.status == 201) {
            return apiResponse.data;
        } else {
            throw new Error('Failed to get a response, Please try again.');
        }
    } catch (error) {
        throw new Error(error.message);
    }
};

const verifyFace = async (data) => {
    try {
        const apiResponse = await modelModule.verifyFaceRecognition(data);

        if (apiResponse.status == 200) {
            return apiResponse.data;
        } else {
            throw new Error('Failed to get a response, Please try again.');
        }
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
   validateTitle,
   uploadFace,
   verifyFace
};
