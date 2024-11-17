const Boom = require('@hapi/boom');
const firestore = require('../server/firebase');
const customersCollection = firestore.collection('customers');

const verifyCustomer = async (request, h) => {
    const { userId, role } = request.auth.credentials;

    if (role != 1) {
        throw Boom.forbidden('Access denied, You are not a customer.');
    }

    const snapshot = await customersCollection.where('user_id', '==', userId).get();
    if (snapshot.empty) {
        throw Boom.notFound('Customer not found, Please try again.');
    }

    return h.continue;
};

module.exports = { verifyCustomer };
