require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const validate = require('./validate');
const registerRoutes = require('../routes/register.routes');
const loginRoutes = require('../routes/login.routes');

(async () => {
    const server = Hapi.server({
        port: process.env.PORT,
        host: 'localhost',
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register(Jwt);
    server.auth.strategy('jwt', 'jwt', {
        keys: process.env.JWT_SECRET,
        validate,                    
        verify: {                    
            aud: process.env.JWT_AUD,
            iss: process.env.JWT_ISS,
            sub: process.env.JWT_SUB,
        }
    });

    server.auth.default('jwt');

    server.route(registerRoutes);
    server.route(loginRoutes);

    await server.start();
    console.log(`Server start on ${server.info.uri}`);

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});
})();