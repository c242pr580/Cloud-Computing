const snap = require('../third_party/midtransConfig');
const apiClient = require('../third_party/midtransConfig');
const transactionsModule = require('../transaction/transactions.module');
const jobsModule = require('../jobs/jobs.module');
const customersModule = require('../customer/customers.module');
const usersModule = require('../user/user.module');
const crypto = require('crypto');
const { getCurrentTime } = require('../utils/time');

const createPayment = async (userId, job_id) => {
    const customer = await customersModule.findCustomerByUserId(userId);
    if (!customer) {
        throw new Error('Customer profile not found, Please try again.');
    }

    const { customer_id } = customer;
    const user = await usersModule.findUserById(userId);
    if (!user) {
        throw new Error('User not found, Please ensure the user exists and try again.');
    }

    const { name, email } = user;
    const job = await jobsModule.findJobById(job_id);
    if (!job) {
        throw new Error('Job not found, Please check your job id.');
    }

    const existingTransaction = await transactionsModule.findTransactionByJobId(job_id);

    if (existingTransaction) {
        if (existingTransaction.status === 'Pending') {
            throw new Error('A payment is already in progress for this job, Please completed the payment.');
        }

        if (existingTransaction.status === 'Completed') {
            throw new Error('Payment for this job has already been completed.');
        }
    }

    if (job.status != 'In Progress') {
        throw new Error('Your job has not been taken by Mitra, Please try again.');
    }

    const { cost, title } = job;

    const order_id = `order-${crypto.randomUUID()}`;
    await jobsModule.updateJobWithOrderId(job_id, order_id);

    const transaction_id = `transaction-${crypto.randomUUID()}`;
    await transactionsModule.addTransaction({
        transaction_id,
        job_id,
        order_id,
        gross_amount: cost,
        status: 'Pending',
        customer_id,
        createdAt: getCurrentTime(),
        updatedAt: getCurrentTime(),
    });

    const parameter = {
        transaction_details: {
            order_id,
            gross_amount: cost,
        },
        item_details: [
            {
                id: job_id,
                price: cost,
                quantity: 1,
                name: title,
            },
        ],
        customer_details: {
            first_name: name,
            email: email,
        },
    };

    const transaction = await snap.createTransaction(parameter);
    return {
        paymentUrl: transaction.redirect_url,
        order_id,
    };
};

const processPaymentNotification = async (notification) => {
    const transactionStatus = await apiClient.transaction.status(notification.order_id);

    const { order_id, transaction_status, gross_amount, fraud_status } = transactionStatus;

    const job = await jobsModule.findJobByOrderId(order_id);
    if (!job) {
        throw new Error('Job not found, Please check your job id.');
    }

    const job_id = job.job_id;

    let status;
    switch (transaction_status) {
        case 'settlement':
            status = 'Completed';
            break;
        case 'pending':
            status = 'Pending';
            break;
        case 'expire':
            status = 'Expired';
            break;
        case 'cancel':
            status = 'Canceled';
            break;
        default:
            status = 'Unknown';
    }

    const transaction = await transactionsModule.findTransactionByJobId(job_id);
    if (transaction) {
        await transactionsModule.updateTransaction(transaction.id, {
            status,
            updatedAt: getCurrentTime(),
        });
    } else {
        const transaction_id = `transaction-${crypto.randomUUID()}`;
        await transactionsModule.addTransaction({
            transaction_id,
            job_id,
            order_id,
            gross_amount,
            status,
            customer_id: job.customer_id,
            mitra_id: job.mitra_id,
            createdAt: getCurrentTime(),
            updatedAt: getCurrentTime(),
        });
    }

    return { status: 'success', transaction_status, fraud_status };
};

module.exports = {
    createPayment,
    processPaymentNotification
};