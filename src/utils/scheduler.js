const cron = require('node-cron');
const jobsService = require('../jobs/jobs.service');

cron.schedule('*/10 * * * *', async () => {
    const canceledJobs = await jobsService.checkAndCancelOverdueJobs();
    console.log(`${canceledJobs.length} Jobs Canceled...`);
});
