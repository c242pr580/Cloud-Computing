const firestore = require('../server/firebase');
const transactionsCollection = firestore.collection('transactions');

const addTransaction = async (transactionData) => {
    const transactionRef = transactionsCollection.doc(transactionData.transaction_id);
    await transactionRef.set(transactionData);
    return { id: transactionRef.id, ...transactionData };
};

const findTransactionByJobId = async (job_id) => {
    const snapshot = await transactionsCollection.where('job_id', '==', job_id).get();
    if (snapshot.empty) {
        return null;
    }

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0];
};

const updateTransaction = async (transaction_id, updatedData) => {
    const transactionRef = transactionsCollection.doc(transaction_id);
    await transactionRef.update(updatedData);
};

module.exports = {
    addTransaction,
    findTransactionByJobId,
    updateTransaction,
};
