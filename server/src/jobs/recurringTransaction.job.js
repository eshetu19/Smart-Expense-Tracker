
import cron from 'node-cron';
import recurringTransactionService from '../services/recurringTransaction.service.js';
import logger from '../utils/logger.js';


const SCHEDULE = '*/15 * * * *';

let task = null;

const run = async () => {
  try {
    const result = await recurringTransactionService.executeDue();
    if (result.processed > 0 || result.failed > 0) {
      logger.info('Recurring transaction job completed', result);
    }
  } catch (err) {
    logger.error('Recurring transaction job crashed', {
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
  logger.info('Recurring transaction job scheduled', { schedule: SCHEDULE });
};

const stop = () => {
  if (task) {
    task.stop();
    task = null;
    logger.info('Recurring transaction job stopped');
  }
};

export default { start, stop, run };