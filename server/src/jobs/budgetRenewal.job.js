
import cron from 'node-cron';
import budgetService from '../services/budget.service.js';
import logger from '../utils/logger.js';


const SCHEDULE = '5 0 * * *';

let task = null;

const run = async () => {
  try {
    const result = await budgetService.renewExpired();
    if (result.processed > 0) {
      logger.info('Budget renewal job completed', result);
    }
  } catch (err) {
    logger.error('Budget renewal job crashed', {
      error: err.message,
      stack: err.stack,
    });
  }
};

const start = () => {
  if (task) return;
  task = cron.schedule(SCHEDULE, run, {
    scheduled: true,
    timezone: 'Africa/Addis_Ababa',
  });
  logger.info('Budget renewal job scheduled', { schedule: SCHEDULE });
};

const stop = () => {
  if (task) {
    task.stop();
    task = null;
    logger.info('Budget renewal job stopped');
  }
};

export default { start, stop, run };