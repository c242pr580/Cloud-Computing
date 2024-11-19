const crypto = require('crypto');
const jobsModule = require('../jobs/jobs.module');

const addJobById = async (jobData) => {
    const { title, deadline, location, cost, description, image, customer_id } = jobData;
    const job_id = `job-${crypto.randomUUID()}`;

    const newJob = {
        job_id,
        title,
        deadline,
        location,
        cost,
        description,
        image: image || null,
        customer_id,
        status: 'Pending', 
        createdAt: new Date().toISOString(),
    };

    await jobsModule.addJob(newJob);
    return newJob;
};

const deleteJobById = async (job_id, customer_id) => {
    const job = await jobsModule.findJobById(job_id);
    if (!job) {
        throw new Error('Job not found, Please check your job id.');
    }

    if (job.customer_id != customer_id) {
        throw new Error('Access denied, You do not have permission to delete this job.');
    }

    await jobsModule.deleteJob(job_id);
};

const getJobsByCustomerId = async (customer_id) => {
    if (!customer_id) {
        throw new Error('Customer id is required, Please try again.');
    }
    const jobs = await jobsModule.findJobsByCustomerId(customer_id);
    return jobs;
};

const getJobsByMitraId = async (mitra_id) => {
    if (!mitra_id) {
        throw new Error('Mitra id is required, Please try again.');
    }
    const jobs = await jobsModule.findJobsByMitraId(mitra_id);
    return jobs;
};

const getJobById = async (job_id) => {
    return await jobsModule.findJobById(job_id);
};

const updateJob = async (job_id, updatedData) => {
    await jobsModule.updateJobById(job_id, updatedData);
};

const assignJob = async (job_id, mitra_id) => {
    const job = await jobsModule.findJobById(job_id);

    const updatedJob = {
        ...job,
        mitra_id,
        status: 'In Progress',
    };

    await jobsModule.updateJobById(job_id, updatedJob);
    return updatedJob;
};

module.exports = {
    addJobById,
    deleteJobById,
    getJobsByCustomerId,
    getJobsByMitraId,
    updateJob,
    getJobById,
    assignJob,
};
