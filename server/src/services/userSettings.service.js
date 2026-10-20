
import userSettingsRepository from '../repositories/userSettings.repository.js';
import accountRepository from '../repositories/account.repository.js';
import ApiError from '../utils/ApiError.js';
import { DEFAULTS } from '../config/constants.js';

const getByUser = async (userId) => {
  return await userSettingsRepository.upsertByUser(userId, {});
};

const update = async (userId, data) => {
  if (data.defaultAccountId) {
    const account = await accountRepository.findByIdAndUser(
      data.defaultAccountId,
      userId
    );
    if (!account) {
      throw ApiError.badRequest('Default account not found or not yours');
    }
  }

  return await userSettingsRepository.upsertByUser(userId, data);
};

const resetToDefaults = async (userId) => {
  return await userSettingsRepository.upsertByUser(userId, {
    preferredCurrency: DEFAULTS.CURRENCY,
    language: DEFAULTS.LANGUAGE,
    theme: DEFAULTS.THEME,
    timezone: DEFAULTS.TIMEZONE,
    dateFormat: DEFAULTS.DATE_FORMAT,
    timeFormat: DEFAULTS.TIME_FORMAT,
    firstDayOfWeek: DEFAULTS.FIRST_DAY_OF_WEEK,
    defaultExportFormat: DEFAULTS.EXPORT_FORMAT,
    defaultBudgetAlertPercentage: DEFAULTS.BUDGET_ALERT_PERCENT,
    defaultTransactionType: 'EXPENSE',
    notificationEnabled: true,
    emailNotifications: true,
    pushNotifications: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  });
};

const getPreferredCurrency = async (userId) => {
  const settings = await getByUser(userId);
  return settings.preferredCurrency;
};

const getTimeZone = async (userId) => {
  const settings = await getByUser(userId);
  return settings.timezone;
};

const isNotificationEnabled = async (userId) => {
  const settings = await getByUser(userId);
  return settings.notificationEnabled;
};

const isQuietHoursNow = async (userId, currentHour = null) => {
  const settings = await getByUser(userId);
  if (!settings.quietHoursEnabled) return false;

  const hour = currentHour ?? new Date().getHours();
  return settings.isQuietHour(hour);
};

export default {
  getByUser,
  update,
  resetToDefaults,
  getPreferredCurrency,
  getTimeZone,
  isNotificationEnabled,
  isQuietHoursNow,
};