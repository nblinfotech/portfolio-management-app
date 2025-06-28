const schedule = require('node-schedule');
const logger = require('../config/core/logger');
const moment = require('moment');

// ==========================
// Example Task Files
// ==========================
// 1. Create task files (e.g., task1.js) in the same folder as this script.
//    Each file should export a function that contains the task logic you want to run.
//    E.g., task1.js may contain:
//
/*
 * task1.js:
 * module.exports = function() {
 *   // Task-specific logic
 *   console.log('Task 1 executed');
 * };
 */
// 2. Use the 'require' statement to include each task that needs to be run on the schedule.


// ==========================
// Cron Syntax for Scheduling
// ==========================
/*
 * The cron syntax for node-schedule is as follows:
 *
 * ┌───────────── minute (0 - 59)
 * │ ┌───────────── hour (0 - 23)
 * │ │ ┌───────────── day of month (1 - 31)
 * │ │ │ ┌───────────── month (1 - 12)
 * │ │ │ │ ┌───────────── day of week (0 - 6) (Sunday = 0)
 * │ │ │ │ │
 * │ │ │ │ │
 * * * * * * (Example)
 *
 * For example, to run a task every hour on the hour:
 * schedule.scheduleJob('0 * * * *', () => { ... });
 *
 * Or to run a task every day at midnight:
 * schedule.scheduleJob('0 0 * * *', () => { ... });
 *
 * Refer to the documentation for more complex scheduling patterns.
 */


// Task to run every minute
schedule.scheduleJob('* * * * *', () => {
  logger.info(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] Running task every minute...`);

  // list of tasks
  require('./autoEscalateApproverRequest')();
});



// logger.info('Schedulers initialized.');
