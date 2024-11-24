const { getUserBiodataHandler, updateUserBiodataHandler} = require('../user/user.controller');
const { getUserDetailByCustomerIdHandler, getUserDetailByMitraIdHandler } = require('../user/user.controller');

module.exports = [
    {
        method: 'GET',
        path: '/biodata',
        handler: getUserBiodataHandler,
        options: {
            auth: 'jwt',
        },
    },
    {
        method: 'POST',
        path: '/biodata/update',
        handler: updateUserBiodataHandler,
        options: {
            auth: 'jwt',
            payload: {
                output: 'stream',
                parse: true,
                multipart: true,
                maxBytes: 1 * 1024 * 1024,
            },
        },
    },
    {
        method: 'GET',
        path: '/user/customer/{customer_id}',
        handler: getUserDetailByCustomerIdHandler,
        options: {
            auth: 'jwt',
        },
    },
    {
        method: 'GET',
        path: '/user/mitra/{mitra_id}',
        handler: getUserDetailByMitraIdHandler,
        options: {
            auth: 'jwt',
        },
    },
];
