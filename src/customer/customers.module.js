const firestore = require('../server/firebase');
const customersCollection = firestore.collection('customers');

const findCustomerByUserId = async (userId) => {
    const snapshot = await customersCollection.where('user_id', '==', userId).get();
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

module.exports = {
    findCustomerByUserId,
};
