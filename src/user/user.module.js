const firestore = require('../server/firebase');
const userCollection = firestore.collection('users');

const findUserById = async (userId) => {
    const userDoc = await userCollection.doc(userId).get();
    if (!userDoc.exists) {
        return null;
    }
    return { user_id: userDoc.id, ...userDoc.data() };
};

const findUserByEmail = async (email) => {
    const querySnapshot = await userCollection.where('email', '==', email).get();
    if (querySnapshot.empty) {
        return null;
    }
    const userDoc = querySnapshot.docs[0];
    return { user_id: userDoc.id, ...userDoc.data() };
};

module.exports = {
    findUserById,
    findUserByEmail,
};
