const { verifyRole } = require('../middleware/role.middleware');

module.exports = [
    {
        method: 'GET',
        path: '/mitra',
        // handler: loginHandler,
        options: {
            auth: 'jwt',
            pre: [verifyRole(2)],
        },
        handler: (request, h) => {
            return { message: 'Welcome to the mitra dashboard!' };
        },
    }
];
