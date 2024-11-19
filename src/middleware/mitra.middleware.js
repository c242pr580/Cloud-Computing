const Boom = require('@hapi/boom');
const firestore = require('../server/firebase');
const mitrasCollection = firestore.collection('mitras');

const verifyMitra = async (request, h) => {
    const { userId, role } = request.auth.credentials;

    if (role != 2) {
        throw Boom.forbidden('Access denied, You are not a mitra.');
    }

    const snapshot = await mitrasCollection.where('user_id', '==', userId).get();
    if (snapshot.empty) {
        throw Boom.notFound('Mitra not found, Please try again.');
    }

    return h.continue;
};

module.exports = { verifyMitra };
