require('dotenv').config();
const Hapi = require('@hapi/hapi');
const registerRoutes = require('../routes/register.routes');

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

    server.route(registerRoutes);

    await server.start();
    console.log(`Server start on ${server.info.uri}`);

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});
})();