const { verifyMitra } = require('../middleware/mitra.middleware');
const { assignJobHandler, getJobsByMitraHandler, getAllJobsHandler, getPendingJobsHandler } = require('../jobs/jobs.controller');

module.exports = [
    {
        method: 'GET',
        path: '/mitra',
        options: {
            auth: 'jwt',
            pre: [verifyMitra],
        },
        handler: (request, h) => {
            return { message: 'Welcome to the mitra dashboard!' };
        },
    },
    {
        method: 'POST',
        path: '/mitra/jobs/assign/{job_id}',
        options: {
            auth: 'jwt',
            pre: [verifyMitra],
        },
        handler: assignJobHandler,
    },
    {
        method: 'GET',
        path: '/mitra/jobs',
        options: {
            auth: 'jwt',
            pre: [verifyMitra],
        },
        handler: getJobsByMitraHandler,
    },
    {
        method: 'GET',
        path: '/alljobs',
        options: {
            auth: 'jwt',
            pre: [verifyMitra],
        },
        handler: getAllJobsHandler,
    },
    {
        method: 'GET',
        path: '/jobs/pending',
        options: {
            auth: 'jwt',
            pre: [verifyMitra],
        },
        handler: getPendingJobsHandler,
    },
];
