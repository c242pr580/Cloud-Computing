const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
    projectId: process.env.PROJECT_ID,
    keyFilename: process.env.SERVICE_KEY_JSON,
});

const uploadFileToCloudStorage = async (fileStream, fileName, contentType) => {
    const bucket = storage.bucket(process.env.BUCKET_NAME);
    const cloudFile = bucket.file(fileName);

    const stream = cloudFile.createWriteStream({
        metadata: { contentType },
    });

    fileStream.pipe(stream);

    return new Promise((resolve, reject) => {
        stream.on('finish', () => {
            const publicUrl = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${fileName}`;
            resolve(publicUrl);
        });
        stream.on('error', reject);
    });
};

module.exports = { uploadFileToCloudStorage };
