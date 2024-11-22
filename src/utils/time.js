const moment = require('moment-timezone');

const getCurrentTime = () => {
    return moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
};

module.exports = {
    getCurrentTime
};
