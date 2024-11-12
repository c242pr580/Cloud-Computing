const { Firestore } = require('@google-cloud/firestore');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
db.settings({
    ignoreUndefinedProperties: true
});

const firestore = new Firestore({
    projectId: process.env.PROJECT_ID, 
    keyFilename: process.env.SERVICE_KEY_JSON
});

module.exports = firestore;