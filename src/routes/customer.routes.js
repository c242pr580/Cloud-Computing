// const { verifyRole } = require('../middleware/role.middleware');
const { verifyCustomer } = require('../middleware/customer.middleware');


module.exports = [
    {
        method: 'GET',
        path: '/customer',
        // handler: loginHandler,
        options: {
            auth: 'jwt',
            pre: [verifyCustomer],
            // pre: [verifyRole(1)],
        },
        handler: (request, h) => {
            return { message: 'Welcome to the customer dashboard!' };
        },
    }
];
