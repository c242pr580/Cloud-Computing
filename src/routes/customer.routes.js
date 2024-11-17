const { verifyRole } = require('../middleware/role.middleware');

module.exports = [
    {
        method: 'GET',
        path: '/customer',
        // handler: loginHandler,
        options: {
            auth: 'jwt',
            pre: [verifyRole(1)],
        },
        handler: (request, h) => {
            return { message: 'Welcome to the customer dashboard!' };
        },
    }
];
