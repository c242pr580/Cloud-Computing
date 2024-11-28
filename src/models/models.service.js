const axios = require('axios');

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

const validateTitle = async (title) => {
    try {
        const apiResponse = await modelapiNlp({ title });

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
};
