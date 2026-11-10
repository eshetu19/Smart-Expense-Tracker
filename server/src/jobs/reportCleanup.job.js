
import cron from 'node-cron';
import reportExportRepository from '../repositories/reportExport.repository.js';
import fileService from '../services/file.service.js';
import logger from '../utils/logger.js';


const SCHEDULE = '0 3 * * *';

let task = null;

const run = async () => {
  try {
    const expired = await reportExportRepository.findExpired(new Date());

    if (expired.length === 0) return;

    let deleted = 0;
    let failed = 0;

    for (const report of expired) {
      try {
        
        if (report.storageKey) {
          try {
            await fileService.deleteFile(report.storageKey);
          } catch (fileErr) {
            logger.warn('Failed to delete report file during cleanup', {
              reportId: String(report._id),
              error: fileErr.message,
            });
          }
        }

        
        await reportExportRepository.deleteById(report._id);
        deleted++;
      } catch (err) {
        failed++;
        logger.error('Failed to clean up expired report', {
          reportId: String(report._id),
          error: err.message,
        });
      }
    }

    logger.info('Report cleanup job completed', {
      total: expired.length,
      deleted,
      failed,
    });
  } catch (err) {
    logger.error('Report cleanup job crashed', {
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
  logger.info('Report cleanup job scheduled', { schedule: SCHEDULE });
};

const stop = () => {
  if (task) {
    task.stop();
    task = null;
    logger.info('Report cleanup job stopped');
  }
};

export default { start, stop, run };