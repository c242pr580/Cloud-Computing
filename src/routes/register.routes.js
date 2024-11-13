const { registerHandler } = require('../register/register.controller');

module.exports = [
    {
        method: 'POST',
        path: '/register',
        handler: registerHandler,
        options: {
            auth: false
        }
    },
];