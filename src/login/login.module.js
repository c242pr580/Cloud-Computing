const db = require('../server/firebase');

const findUserByEmail = async (email) => {
    const userCollection = db.collection('users');
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
