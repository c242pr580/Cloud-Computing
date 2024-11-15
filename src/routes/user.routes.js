const { getUserBiodataHandler } = require('../user/user.controller');

module.exports = [
    {
        method: 'GET',
        path: '/user/biodata',
        handler: getUserBiodataHandler,
        options: {
            auth: 'jwt',
        },
    },
];
