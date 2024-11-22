const firestore = require('../server/firebase');
const userCollection = firestore.collection('users');
const customersCollection = firestore.collection('customers');
const mitrasCollection = firestore.collection('mitras');

const findUserByEmail = async (email) => {
    const snapshot = await userCollection.where('email', '==', email).limit(1).get();

    if (snapshot.empty) {
        return null;
    }

    const userDoc = snapshot.docs[0];
    return { user_id: userDoc.id, ...userDoc.data() };
};

const findCustomerByUserId = async (userId) => {
    const snapshot = await customersCollection.where('user_id', '==', userId).get();
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

const findMitraByUserId = async (user_id) => {
    const snapshot = await mitrasCollection.where('user_id', '==', user_id).get();
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

module.exports = {
    findUserByEmail,
    findCustomerByUserId,
    findMitraByUserId
};
