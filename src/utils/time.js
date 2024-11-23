const moment = require('moment-timezone');

const getCurrentTime = () => {
    return moment().tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
};

const getTime = (dateString) => {
    return moment.tz(dateString, 'Asia/Jakarta').toDate();
};

module.exports = {
    getCurrentTime,
    getTime
};
