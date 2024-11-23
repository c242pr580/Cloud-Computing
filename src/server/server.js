require('dotenv').config();
require('../utils/scheduler');
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const validate = require('./validate');
const Boom = require('@hapi/boom');
const { getCurrentTime } = require('../utils/time');
const registerRoutes = require('../routes/register.routes');
const loginRoutes = require('../routes/login.routes');
const userRoutes = require('../routes/user.routes');
const customerRoutes = require('../routes/customer.routes');
const mitraRoutes = require('../routes/mitra.routes');
const adminRoutes = require('../routes/admin.routes');

(async () => {
    const now = getCurrentTime();
    const server = Hapi.server({
        port: process.env.PORT,
        host: 'localhost',
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    server.ext('onRequest', (request, h) => {
        request.url.pathname = request.url.pathname.replace(/\/+/g, '/');
        return h.continue;
    });

    await server.register(Jwt);


    server.auth.strategy('jwt', 'jwt', {
        keys: process.env.JWT_SECRET, 
        verify:{
            aud: false, 
            iss: false,
            sub: false
        },
        validate
    });


    server.auth.default('jwt');

    server.route(registerRoutes);
    server.route(loginRoutes);
    server.route(userRoutes);
    server.route(customerRoutes);
    server.route(mitraRoutes);
    server.route(adminRoutes);

    server.route({
        method: '*',
        path: '/{any*}',
        options: {
            auth: false
        },
        handler: (request, h) => {
            return Boom.notFound('404 Not found');
        }
    });

    await server.start();
    console.log(`Server Time | ${now.toString()}`);
    console.log(`Server start on ${server.info.uri}`);

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});
})();