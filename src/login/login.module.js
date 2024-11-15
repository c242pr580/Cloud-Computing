const firestore = require('../server/firebase');
const userCollection = firestore.collection('users');

const findUserByEmail = async (email) => {
    const snapshot = await userCollection.where('email', '==', email).limit(1).get();

    if (snapshot.empty) {
        return null;
    }

    const userDoc = snapshot.docs[0];
    return { user_id: userDoc.id, ...userDoc.data() };
};

module.exports = {
    findUserByEmail,
};
