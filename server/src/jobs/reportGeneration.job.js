
import cron from 'node-cron';
import reportService from '../services/report.service.js';
import logger from '../utils/logger.js';


const SCHEDULE = '*/30 * * * * *';

let task = null;

const run = async () => {
  try {
    const result = await reportService.processPending();
    if (result.processed > 0 || result.failed > 0) {
      logger.info('Report generation job completed', result);
    }
  } catch (err) {
    logger.error('Report generation job crashed', {
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
  logger.info('Report generation job scheduled', { schedule: SCHEDULE });
};

const stop = () => {
  if (task) {
    task.stop();
    task = null;
    logger.info('Report generation job stopped');
  }
};

export default { start, stop, run };