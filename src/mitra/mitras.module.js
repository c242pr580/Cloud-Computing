const firestore = require('../server/firebase');
const mitrasCollection = firestore.collection('mitras');

const updateMitra = async (mitra_id, updatedData) => {
    const mitraRef = mitrasCollection.doc(mitra_id);
    await mitraRef.update(updatedData);
};

const findMitraByUserId = async (userId) => {
    const snapshot = await mitrasCollection.where('user_id', '==', userId).get();
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

const findMitraById = async (mitra_id) => {
    const mitraDoc = await mitrasCollection.doc(mitra_id).get();
    return mitraDoc.exists ? {...mitraDoc.data() } : null;
};

module.exports = {
    findMitraByUserId,
    findMitraById,
    updateMitra
};