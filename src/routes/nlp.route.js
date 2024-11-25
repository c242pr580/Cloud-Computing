const { NLPHandler } = require('../nlp/nlp.controller');

module.exports = [
    {
        method: 'POST',
        path: '/predict/nlp',
        handler: NLPHandler,
    },
];