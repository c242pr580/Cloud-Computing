const { loginHandler } = require('../login/login.controller');

module.exports = [
    {
        method: 'POST',
        path: '/login',
        handler: loginHandler,
        options: {
            auth: false
        }
    },
];
