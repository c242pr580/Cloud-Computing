const Boom = require('@hapi/boom');
const usersModule = require('../user/user.module');
const jobsService = require('../jobs/jobs.service');
const mitrasService = require('../mitra/mitras.service');
const customersModule = require('../customer/customers.module');
const mitrasModule = require('../mitra/mitras.module');
const transactionsModule = require('../transaction/transactions.module');
const utils = require('../utils/utils');
const { getCurrentTime, getTime } = require('../utils/time');
const { uploadFileToCloudStorage } = require('../server/storage');

const createJobHandler = async (request, h) => {
    if (!request.payload || Object.keys(request.payload).length === 0) {
        const boomError = Boom.badRequest('Request payload cannot be empty.');
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
    try {
        const allowedParams = ['title', 'deadline', 'location', 'cost', 'description', 'image'];
        const payloadKeys = Object.keys(request.payload);
        const invalidParams = payloadKeys.filter((key) => !allowedParams.includes(key));

        if (invalidParams.length > 0) {
            const boomError = Boom.badRequest(`/ ${invalidParams.join(', ')} / not allowed.`);
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const { title, deadline, location, cost, description } = request.payload;
        if (!title || !deadline || !location || !cost || !description) {
            const boomError = Boom.badRequest('Please provide all required fields.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const costRegex = /^\d+$/;
        if (!costRegex.test(cost)) {
            const boomError = Boom.badRequest('Cost must contain only numeric characters (0-9),');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const currentDate = getTime(getCurrentTime());
        const providedDeadline = getTime(deadline);
        currentDate.setHours(0, 0, 0, 0);
        providedDeadline.setHours(0, 0, 0, 0);

        if (providedDeadline < currentDate) {
            const boomError = Boom.badRequest('Deadline cannot be a past date, Please try again.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (Array.isArray(request.payload.image)) {
            const boomError = Boom.badRequest('Only one image is allowed, Please remove any additional files and try again.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const { userId } = request.auth.credentials;

        const customer = await customersModule.findCustomerByUserId(userId);
        if (!customer) {
            const boomError = Boom.notFound('Customer profile not found, Please try again.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const { customer_id } = customer;

        const user = await usersModule.findUserById(userId);
        const { phone } = user;

        let publicUrl = null;
        if (request.payload.image) {
            const file = request.payload.image;
            const fileName = `${customer_id}-${Date.now()}-${file.hapi.filename}`;

            if (!['image/jpeg', 'image/png'].includes(file.hapi.headers['content-type'])) {
                const boomError = Boom.unsupportedMediaType('File type must be JPEG or PNG.');
                return h.response({
                    status: boomError.output.statusCode,
                    message: boomError.message,
                    error: true,
                }).code(boomError.output.statusCode);
            }

            if (file.bytes > 1 * 1024 * 1024) {
                const boomError = Boom.payloadTooLarge('File size must not exceed 1MB.');
                return h.response({
                    status: boomError.output.statusCode,
                    message: boomError.message,
                    error: true,
                }).code(boomError.output.statusCode);
            }

            publicUrl = await uploadFileToCloudStorage(file, fileName, file.hapi.headers['content-type']);
        }

        const newJob = await jobsService.addJobById({
            ...request.payload,
            image: publicUrl,
            customer_id,
            phone
        });

        const result = utils.removeNullProperties(newJob);

        return h.response({
            status: 201,
            message: 'Job created successfully',
            data: result,
            error: false,
        }).code(201);

    } catch (error) {
        const boomError = Boom.badRequest(error.message);
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
};

const getJobsHandler = async (request, h) => {
    try {
        const { userId } = request.auth.credentials;

        const customer = await customersModule.findCustomerByUserId(userId);
        if (!customer) {
            const boomError = Boom.notFound('Customer profile not found, Please try again.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const { customer_id } = customer;

        const jobs = await jobsService.getJobsByCustomerId(customer_id);

        return h.response({
            status: 200,
            message: 'Job retrieved successfully',
            data: jobs,
            error: false,
        }).code(200);

    } catch (error) {
        const boomError = Boom.badRequest(error.message);
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
};

const deleteJobHandler = async (request, h) => {
    try {
        const { job_id } = request.params;
        const { userId } = request.auth.credentials;

        const customer = await customersModule.findCustomerByUserId(userId);
        if (!customer) {
            const boomError = Boom.notFound('Customer profile not found, Please try again.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const { customer_id } = customer;

        const job = await jobsService.getJobById(job_id);
        if (!job) {
            const boomError = Boom.notFound('Job not found, Please check your job id.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (job.status == 'Canceled') {
            const boomError = Boom.badRequest('Job is has been canceled, Please check other jobs.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (job.status == 'Completed') {
            const boomError = Boom.badRequest('Job is has been completed, Please check other jobs.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (job.status != 'Pending') {
            const boomError = Boom.badRequest('Job cannot be deleted, Please try again.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        await jobsService.deleteJobById(job_id, customer_id);

        return h.response({
            status: 200,
            message: 'Job deleted successfully',
            error: false,
        }).code(200);

    } catch (error) {
        const boomError = Boom.badRequest(error.message);
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
};

const updateJobHandler = async (request, h) => {
    if (!request.payload || Object.keys(request.payload).length === 0) {
        const boomError = Boom.badRequest('Request payload cannot be empty.');
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
    try {
        const { job_id } = request.params;
        const { userId } = request.auth.credentials;

        const allowedParams = ['title', 'deadline', 'location', 'cost', 'description', 'image'];
        const payloadKeys = Object.keys(request.payload);
        const invalidParams = payloadKeys.filter((key) => !allowedParams.includes(key));
        if (invalidParams.length > 0) {
            const boomError = Boom.badRequest(`/ ${invalidParams.join(', ')} / not allowed.`);
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const customer = await customersModule.findCustomerByUserId(userId);
        if (!customer) {
            const boomError = Boom.notFound('Customer profile not found, Please try again.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const { customer_id } = customer;

        const job = await jobsService.getJobById(job_id);
        if (!job) {
            const boomError = Boom.notFound('Job not found, Please check your job id.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (job.customer_id != customer_id) {
            const boomError = Boom.forbidden('Access denied, You do not have permission to update this job.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (job.status == 'Canceled') {
            const boomError = Boom.badRequest('Job is has been canceled, Please check other jobs.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (job.status == 'Completed') {
            const boomError = Boom.badRequest('Job is has been completed, Please check other jobs.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (job.status != 'Pending') {
            const boomError = Boom.forbidden('Job is has been in progress, Please check other jobs.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        let publicUrl = job.image;

        if (Array.isArray(request.payload.image)) {
            const boomError = Boom.badRequest('Only one image is allowed, Please remove any additional files and try again.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (request.payload.image) {
            const file = request.payload.image;
            const fileName = `${customer_id}-${Date.now()}-${file.hapi.filename}`;

            if (!['image/jpeg', 'image/png'].includes(file.hapi.headers['content-type'])) {
                const boomError = Boom.unsupportedMediaType('File type must be JPEG or PNG.');
                return h.response({
                    status: boomError.output.statusCode,
                    message: boomError.message,
                    error: true,
                }).code(boomError.output.statusCode);
            }

            if (file.bytes > 1 * 1024 * 1024) {
                const boomError = Boom.payloadTooLarge('File size must not exceed 1MB.');
                return h.response({
                    status: boomError.output.statusCode,
                    message: boomError.message,
                    error: true,
                }).code(boomError.output.statusCode);
            }

            publicUrl = await uploadFileToCloudStorage(file, fileName, file.hapi.headers['content-type']);
        }

        const updatedJob = {
            title: request.payload.title || job.title,
            deadline: request.payload.deadline || job.deadline,
            location: request.payload.location || job.location,
            cost: request.payload.cost || job.cost,
            description: request.payload.description || job.description,
            image: publicUrl,
        };

        const costRegex = /^\d+$/;
        if (!costRegex.test(updatedJob.cost)) {
            const boomError = Boom.badRequest('Cost must contain only numeric characters (0-9),');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        await jobsService.updateJob(job_id, updatedJob, customer_id);

        return h.response({
            status: 200,
            message: 'Job updated successfully',
            error: false,
        }).code(200);
    } catch (error) {
        const boomError = Boom.badRequest(error.message);
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
};

const assignJobHandler = async (request, h) => {
    try {
        const { job_id } = request.params;
        const { userId } = request.auth.credentials;

        const mitra = await mitrasModule.findMitraByUserId(userId);
        if (!mitra) {
            const boomError = Boom.notFound('Mitra profile not found, Please try again.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const { mitra_id } = mitra;

        const job = await jobsService.getJobById(job_id);
        if (!job) {
            const boomError = Boom.notFound('Job not found, Please check your job id.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (job.status == 'Canceled') {
            const boomError = Boom.badRequest('Job is has been canceled, Please check other jobs.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (job.status == 'Completed') {
            const boomError = Boom.badRequest('Job is has been completed, Please check other jobs.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (job.status != 'Pending') {
            const boomError = Boom.badRequest('Job is has been taken, Please check other jobs.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const updatedJob = await jobsService.assignJob(job_id, mitra_id);

        return h.response({
            status: 200,
            message: 'Job assigned successfully',
            data: updatedJob,
            error: false,
        }).code(200);
    } catch (error) {
        const boomError = Boom.badRequest(error.message);
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
};

const getJobsByMitraHandler = async (request, h) => {
    try {
        const { userId } = request.auth.credentials;

        const mitra = await mitrasModule.findMitraByUserId(userId);
        if (!mitra) {
            const boomError = Boom.notFound('Mitra profile not found, Please try again.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const { mitra_id } = mitra;

        const jobs = await jobsService.getJobsByMitraId(mitra_id);

        return h.response({
            status: 200,
            message: 'Job retrieved successfully.',
            data: jobs,
            error: false,
        }).code(200);
    } catch (error) {
        const boomError = Boom.badRequest(error.message);
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
};

const completeJobHandler = async (request, h) => {
    try {
        const { job_id } = request.params;
        const { userId } = request.auth.credentials;

        const customer = await customersModule.findCustomerByUserId(userId);
        if (!customer) {
            const boomError = Boom.notFound('Customer profile not found, Please try again.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const { customer_id } = customer;

        const job = await jobsService.getJobById(job_id);
        if (!job) {
            const boomError = Boom.notFound('Job not found, Please check your job id.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (job.customer_id != customer_id) {
            const boomError = Boom.forbidden('Access denied, You do not have permission to update this job.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const transaction = await transactionsModule.findTransactionByJobId(job_id);
        if (!transaction || transaction.status != 'Completed') {
            const boomError = Boom.badRequest('Payment is not completed for this job, Please try again.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (job.status == 'Completed') {
            const boomError = Boom.badRequest('Job cannot marked completed, Your job already completed.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (job.status == 'Canceled') {
            const boomError = Boom.badRequest('Job cannot marked completed, Your job canceled.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (job.status != 'In Progress') {
            const boomError = Boom.badRequest('Job cannot marked completed, Your job not in progress.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const updatedJob = await jobsService.completeJob(job_id);

        if (job.mitra_id) {
            await mitrasService.updateTransactionDone(job.mitra_id);
        }

        return h.response({
            status: 200,
            message: 'Job marked as completed successfully',
            data: updatedJob,
            error: false,
        }).code(200);
    } catch (error) {
        const boomError = Boom.badRequest(error.message);
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
};

const cancelOverdueJobsHandler = async (request, h) => {
    try {
        const canceledJobs = await jobsService.checkAndCancelOverdueJobs();
        return h.response({
            status: 200,
            message: 'Overdue jobs checked and canceled successfully',
            data: canceledJobs,
            error: false,
        }).code(200);
    } catch (error) {
        const boomError = Boom.badRequest(error.message);
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
};

const getAllJobsHandler = async (request, h) => {
    try {
        const jobs = await jobsService.getAllJobs();

        return h.response({
            status: 200,
            message: 'All Jobs retrieved successfully',
            data: jobs,
            error: false,
        }).code(200);
    } catch (error) {
        const boomError = Boom.badRequest(error.message);
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
};

const getPendingJobsHandler = async (request, h) => {
    try {
        const jobs = await jobsService.getPendingJobs();

        return h.response({
            status: 200,
            message: 'Pending jobs retrieved successfully',
            data: jobs,
            error: false,
        }).code(200);
    } catch (error) {
        const boomError = Boom.badRequest(error.message);
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
};

const getJobDetailHandler = async (request, h) => {
    try {
        const { job_id } = request.params;
        const job = await jobsService.getJobById(job_id);

        if (!job) {
            const boomError = Boom.notFound('Job not found, Please check your job id.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        return h.response({
            status: 200,
            message: 'Job details retrieved successfully',
            data: job,
            error: false,
        }).code(200);
    } catch (error) {
        const boomError = Boom.badRequest(error.message);
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
};

const addRatingHandler = async (request, h) => {
    if (!request.payload || Object.keys(request.payload).length === 0) {
        const boomError = Boom.badRequest('Request payload cannot be empty.');
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
    try {
        const { job_id } = request.params;
        const { rating } = request.payload;
        const { userId } = request.auth.credentials;

        const allowedParams = ['rating'];
        const payloadKeys = Object.keys(request.payload);
        const invalidParams = payloadKeys.filter((key) => !allowedParams.includes(key));
        if (invalidParams.length > 0) {
            const boomError = Boom.badRequest(`/ ${invalidParams.join(', ')} / not allowed.`);
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const customer = await customersModule.findCustomerByUserId(userId);
        if (!customer) {
            const boomError = Boom.notFound('Customer profile not found, Please try again.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
            const boomError = Boom.badRequest('Rating must be a number between 1 and 5.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const job = await jobsService.getJobById(job_id);
        if (!job) {
            const boomError = Boom.notFound('Job not found, Please check your job id.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (job.rating) {
            const boomError = Boom.badRequest('Rating has already been added to this job.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const { customer_id } = customer;

        if (job.customer_id != customer_id) {
            const boomError = Boom.forbidden('Access denied, You do not have permission to rating this job.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        if (job.status != 'Completed') {
            const boomError = Boom.badRequest('Rating can only be given for completed jobs, Please try again.');
            return h.response({
                status: boomError.output.statusCode,
                message: boomError.message,
                error: true,
            }).code(boomError.output.statusCode);
        }

        const updatedJob = await jobsService.addRatingToJob(job_id, rating);

        if (job.mitra_id) {
            await mitrasService.updateMitraRating(job.mitra_id);
        }

        return h.response({
            status: 200,
            message: 'Rating added successfully',
            error: false,
        }).code(200);
    } catch (error) {
        const boomError = Boom.badRequest(error.message);
        return h.response({
            status: boomError.output.statusCode,
            message: boomError.message,
            error: true,
        }).code(boomError.output.statusCode);
    }
};

module.exports = {
    createJobHandler,
    getJobsHandler,
    deleteJobHandler,
    updateJobHandler,
    assignJobHandler,
    getJobsByMitraHandler,
    completeJobHandler,
    cancelOverdueJobsHandler,
    getPendingJobsHandler,
    getAllJobsHandler,
    getJobDetailHandler,
    addRatingHandler
};
