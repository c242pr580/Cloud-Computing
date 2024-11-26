const firestore = require('../server/firebase');
const userCollection = firestore.collection('users');
const customersCollection = firestore.collection('customers');
const mitrasCollection = firestore.collection('mitras');

const addUser = async (userData) => {
    const userRef = userCollection.doc(userData.user_id);
    await userRef.set(userData);
    return { id: userRef.id, ...userData };
};

const addCustomer = async (customerData) => {
    const customerRef = customersCollection.doc(customerData.customer_id);
    await customerRef.set(customerData);
    return { id: customerRef.id, ...customerData };
}; 

const addMitra = async (mitraData) => {
    const mitraRef = mitrasCollection.doc(mitraData.mitra_id);
    await mitraRef.set(mitraData);
    return { id: mitraRef.id, ...mitraData };
};

const findUserByUsername = async (username) => {
    const snapshot = await userCollection.where('username', '==', username).get();
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

const findUserByEmail = async (email) => {
    const snapshot = await userCollection.where('email', '==', email).get();
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

module.exports = {
    addUser,
    findUserByUsername,
    findUserByEmail,
    addCustomer,
    addMitra
};
