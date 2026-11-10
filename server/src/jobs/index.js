
import recurringTransactionJob from './recurringTransaction.job.js';
import budgetRenewalJob from './budgetRenewal.job.js';
import reportGenerationJob from './reportGeneration.job.js';
import reportCleanupJob from './reportCleanup.job.js';
import logger from '../utils/logger.js';


const jobs = [
  { name: 'recurringTransaction', handler: recurringTransactionJob },
  { name: 'budgetRenewal', handler: budgetRenewalJob },
  { name: 'reportGeneration', handler: reportGenerationJob },
  { name: 'reportCleanup', handler: reportCleanupJob },
];


const startAll = async () => {
  let started = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      await job.handler.start();
      started++;
    } catch (err) {
      failed++;
      logger.error(`Failed to start job: ${job.name}`, {
        job: job.name,
        error: err.message,
        stack: err.stack,
      });
    }
  }

  logger.info('Jobs initialized', { started, failed, total: jobs.length });

  if (failed > 0) {
    throw new Error(`${failed} of ${jobs.length} jobs failed to start`);
  }
};


const stopAll = () => {
  let stopped = 0;
  let failed = 0;

  for (const job of jobs) {
    try {
      job.handler.stop();
      stopped++;
    } catch (err) {
      failed++;
      logger.error(`Failed to stop job: ${job.name}`, {
        job: job.name,
        error: err.message,
      });
    }
  }

  logger.info('Jobs stopped', { stopped, failed, total: jobs.length });
};


export default { startAll, stopAll };