const mitrasModule = require('../mitra/mitras.module');
const jobsModule = require('../jobs/jobs.module');

const getMitraByUserId = async (user_id) => {
    return await mitrasModule.findMitraByUserId(user_id);
};

const updateMitraData = async (mitra_id, updatedData) => {
    const mitra = await mitrasModule.findMitraById(mitra_id);
    if (!mitra) {
        throw new Error('Mitra not found, Please try again.');
    }

    const updatedMitra = {
        ...mitra,
        ...updatedData
    };

    await mitrasModule.updateMitra(mitra_id, updatedMitra);
    return updatedMitra;
};

const updateTransactionDone = async (mitra_id) => {
    const completedJobs = await jobsModule.findJobsByMitraIdAndStatus(mitra_id, 'Completed');
    const transaction_done = completedJobs.length;

    const mitra = await mitrasModule.findMitraById(mitra_id);
    if (!mitra) {
        throw new Error('Mitra not found, Please try again.');
    }

    await mitrasModule.updateMitra(mitra_id, {
        ...mitra,
        transaction_done: transaction_done.toString()
    });
};

const updateMitraRating = async (mitra_id) => {
    const completedJobs = await jobsModule.findJobsByMitraIdAndStatus(mitra_id, 'Completed');
    const validRatings = completedJobs
        .map((job) => parseFloat(job.rating))
        .filter((rating) => !isNaN(rating) && rating >= 1 && rating <= 5);

    const totalRatings = validRatings.reduce((sum, rating) => sum + rating, 0);
    const rawRating = validRatings.length > 0 ? totalRatings / validRatings.length : 0;
    const rating = rawRating.toFixed(1);

    const mitra = await mitrasModule.findMitraById(mitra_id);
    if (!mitra) {
        throw new Error('Mitra not found, Please try again.');
    }

    const updatedMitra = {
        ...mitra,
        rating
    };

    await mitrasModule.updateMitra(mitra_id, updatedMitra);

    return updatedMitra;
};



module.exports = {
    getMitraByUserId,
    updateMitraData,
    updateTransactionDone,
    updateMitraRating
};