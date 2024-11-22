const { cancelOverdueJobsHandler } = require('../jobs/jobs.controller');

module.exports = [
    {
        method: 'GET',
        path: '/jobs/canceled',
        handler: cancelOverdueJobsHandler,
        options: {
            auth: 'jwt',
        },
    },
];
