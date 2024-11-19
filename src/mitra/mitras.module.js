const firestore = require('../server/firebase');
const mitrasCollection = firestore.collection('mitras');

const findMitraByUserId = async (userId) => {
    const snapshot = await mitrasCollection.where('user_id', '==', userId).get();
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

module.exports = {
    findMitraByUserId,
};