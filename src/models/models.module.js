const axios = require('axios');
const FormData = require('form-data');

const modelapiNlp = async (data) => {
    try {
        const response = await axios.post(process.env.EXTERNAL_API_URL, data, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.message);
    }
};

const uploadFaceRecognition = async (data) => {
    try {
        const form = new FormData();
        form.append('verification_image', Buffer.from(data.verification_image._data), {
            filename: data.verification_image.hapi.filename || 'image.jpg',
            contentType: data.verification_image.hapi.headers['content-type'] || 'image/jpeg',
        });
        form.append('customer_id', data.customer_id);

        const response = await axios.post(process.env.UPLOAD_API_URL, form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        return response.data;
    } catch (error) {
        throw new Error(error.message);
    }
};

const verifyFaceRecognition = async (data) => {
    try {
        const form = new FormData();
        form.append('input_image', Buffer.from(data.input_image._data), {
            filename: data.input_image.hapi.filename || 'image.jpg',
            contentType: data.input_image.hapi.headers['content-type'] || 'image/jpeg',
        });
        form.append('customer_id', data.customer_id);

        const response = await axios.post(process.env.VERIFY_API_URL, form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        return response.data;
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    modelapiNlp,
    uploadFaceRecognition,
    verifyFaceRecognition
}; 