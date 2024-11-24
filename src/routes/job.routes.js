const { cancelOverdueJobsHandler, getJobDetailHandler } = require('../jobs/jobs.controller');

module.exports = [
    {
        method: 'GET',
        path: '/jobs/canceled',
        handler: cancelOverdueJobsHandler,
        options: {
            auth: 'jwt',
        },
    },
    {
        method: 'GET',
        path: '/jobs/detail/{job_id}',
        handler: getJobDetailHandler,
        options: {
            auth: 'jwt',
        },
    },
];
