const { verifyCustomer } = require('../middleware/customer.middleware');
const { createJobHandler, getJobsHandler, deleteJobHandler, updateJobHandler, completeJobHandler } = require('../jobs/jobs.controller');
const { createPaymentHandler, handlePaymentNotification } = require('../transaction/transactions.controller');

module.exports = [
    {
        method: 'GET',
        path: '/customer',
        options: {
            auth: 'jwt',
            pre: [verifyCustomer],
        },
        handler: (request, h) => {
            return { message: 'Welcome to the customer dashboard!' };
        },
    },
    {
        method: 'POST',
        path: '/customer/jobs/create',
        options: {
            auth: 'jwt',
            pre: [verifyCustomer],
            payload: {
                output: 'stream',
                parse: true,
                multipart: true,
                maxBytes: 1 * 1024 * 1024,
            },
        },
        handler: createJobHandler,
    },
    {
        method: 'GET',
        path: '/customer/jobs',
        options: {
            auth: 'jwt',
            pre: [verifyCustomer],
        },
        handler: getJobsHandler,
    },
    {
        method: 'DELETE',
        path: '/customer/jobs/delete/{job_id}',
        options: {
            auth: 'jwt', 
            pre: [verifyCustomer],
        },
        handler: deleteJobHandler,
    },
    {
        method: 'POST',
        path: '/customer/jobs/update/{job_id}',
        options: {
            auth: 'jwt', 
            pre: [verifyCustomer],
            payload: {
                output: 'stream',
                parse: true,
                multipart: true,
                maxBytes: 1 * 1024 * 1024,
            },
        },
        handler: updateJobHandler,
    },
    {
        method: 'POST',
        path: '/customer/jobs/complete/{job_id}',
        options: {
            auth: 'jwt',
            pre: [verifyCustomer],
        },
        handler: completeJobHandler,
    },
    {
        method: 'POST',
        path: '/customer/payment/create',
        options: {
            auth: 'jwt',
            pre: [verifyCustomer],
        },
        handler: createPaymentHandler,
    },
    {
        method: 'POST',
        path: '/customer/payment/notification',
        handler: handlePaymentNotification,
        options: {
            auth: false,
        },
    },
];
