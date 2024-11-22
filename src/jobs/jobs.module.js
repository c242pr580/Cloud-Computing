const firestore = require('../server/firebase');
const jobsCollection = firestore.collection('jobs');

const addJob = async (jobData) => {
    const jobRef = jobsCollection.doc(jobData.job_id);
    await jobRef.set(jobData);
    return { id: jobRef.id, ...jobData };
};

const findJobById = async (job_id) => {
    const jobDoc = await jobsCollection.doc(job_id).get();
    return jobDoc.exists ? {...jobDoc.data() } : null;
};

const deleteJob = async (job_id) => {
    const jobDoc = jobsCollection.doc(job_id);
    const snapshot = await jobDoc.get();

    if (!snapshot.exists) {
        throw new Error('Job not found, Please check your job id.');
    }

    await jobDoc.delete();
};

const findJobsByCustomerId = async (customer_id) => {
    const snapshot = await jobsCollection.where('customer_id', '==', customer_id).get();
    if (snapshot.empty) {
        return [];
    }

    const jobs = [];
    snapshot.forEach((doc) => {
        jobs.push({...doc.data()});
    });

    return jobs;
};

const findJobsByMitraId = async (mitra_id) => {
    const snapshot = await jobsCollection.where('mitra_id', '==', mitra_id).get();
    if (snapshot.empty) {
        return [];
    }

    const jobs = [];
    snapshot.forEach((doc) => {
        jobs.push({...doc.data()});
    });

    return jobs;
};

const updateJobById = async (job_id, updatedData) => {
    const jobRef = jobsCollection.doc(job_id);
    const snapshot = await jobRef.get();

    if (!snapshot.exists) {
        throw new Error('Job not found, Please check your job id.');
    }

    await jobRef.update(updatedData);
};

const findJobsByStatusAndDeadline = async (status, deadline) => {
    const snapshot = await jobsCollection
        .where('status', '==', status)
        .where('deadline', '<=', deadline)
        .get();

    if (snapshot.empty) {
        return [];
    }

    const jobs = [];
    snapshot.forEach((doc) => {
        jobs.push({ job_id: doc.id, ...doc.data() });
    });

    return jobs;
};

const getAllJobs = async () => {
    const snapshot = await jobsCollection.get();

    if (snapshot.empty) {
        return [];
    }

    const jobs = [];
    snapshot.forEach((doc) => {
        jobs.push({ job_id: doc.id, ...doc.data() });
    });

    return jobs;
};

const getPendingJobs = async () => {
    const snapshot = await jobsCollection.where('status', '==', 'Pending').get();

    if (snapshot.empty) {
        return [];
    }

    const jobs = [];
    snapshot.forEach((doc) => {
        jobs.push({ job_id: doc.id, ...doc.data() });
    });

    return jobs;
};

const updateJobWithOrderId = async (job_id, order_id) => {
    const jobRef = jobsCollection.doc(job_id);
    const jobSnapshot = await jobRef.get();

    if (!jobSnapshot.exists) {
        throw new Error('Job not found, Please check your job id.');
    }

    await jobRef.update({ order_id });
};

const findJobByOrderId = async (order_id) => {
    const snapshot = await jobsCollection.where('order_id', '==', order_id).get();
    if (snapshot.empty) {
        return null;
    }

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0];
};



module.exports = {
    addJob,
    findJobById,
    deleteJob,
    findJobsByCustomerId,
    findJobsByMitraId,
    updateJobById,
    findJobsByStatusAndDeadline,
    getAllJobs,
    getPendingJobs,
    updateJobWithOrderId,
    findJobByOrderId
};
