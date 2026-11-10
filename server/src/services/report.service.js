
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import reportExportRepository from '../repositories/reportExport.repository.js';
import budgetRepository from '../repositories/budget.repository.js';
import transactionService from './transaction.service.js';
import budgetService from './budget.service.js';
import savingsGoalService from './savingsGoal.service.js';
import userSettingsService from './userSettings.service.js';
import fileService from './file.service.js';
import notificationService from './notification.service.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';
import {
  REPORT_TYPES,
  EXPORT_FORMATS,
  NOTIFICATION_TYPES,
  TRANSACTION_TYPES,
  GOAL_STATUSES,
} from '../config/constants.js';


const formatCents = (cents, currency = 'ETB') => {
  return `${(cents / 100).toFixed(2)} ${currency}`;
};

const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

const csvEscape = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};


const buildCsv = (headers, rows) => {
  const lines = [headers.map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push(row.map(csvEscape).join(','));
  }
  return lines.join('\n');
};


const buildPdf = (title, lines) => {
  const content = [
    'BT',
    '/F1 12 Tf',
    '20 800 Td',
    `(${title.replace(/[()\\]/g, '\\$&')}) Tj`,
    '/F1 10 Tf',
    ...lines.map((line) => {
      const escaped = line.replace(/[()\\]/g, '\\$&');
      return `0 -16 Td (${escaped}) Tj`;
    }),
    'ET',
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'binary');
};


const createRequest = async (userId, data) => {
  validateFilters(data.reportType, data.filters);

  const storageKey = `${userId}/${data.reportType}_${Date.now()}_${crypto
    .randomUUID()
    .slice(0, 8)}`;

  const ext =
    data.exportFormat === EXPORT_FORMATS.CSV
      ? 'csv'
      : data.exportFormat === EXPORT_FORMATS.XLSX
      ? 'xlsx'
      : 'pdf';
  const fileName = `${data.reportType}_${formatDate(new Date())}.${ext}`;

  const report = await reportExportRepository.create({
    user: userId,
    reportType: data.reportType,
    exportFormat: data.exportFormat,
    fileName,
    storageKey,
    filters: data.filters ?? null,
    status: 'PENDING',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return report;
};


const validateFilters = (reportType, filters) => {
  if (!filters) {
    throw ApiError.badRequest('Report filters are required');
  }
  if (!filters.startDate || !filters.endDate) {
    throw ApiError.badRequest('startDate and endDate are required');
  }
  const start = new Date(filters.startDate);
  const end = new Date(filters.endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw ApiError.badRequest('Invalid date format');
  }
  if (end < start) {
    throw ApiError.badRequest('endDate must be on or after startDate');
  }

  if (reportType === REPORT_TYPES.CATEGORY_BREAKDOWN) {
    if (
      filters.transactionType &&
      !['INCOME', 'EXPENSE'].includes(filters.transactionType)
    ) {
      throw ApiError.badRequest('transactionType must be INCOME or EXPENSE');
    }
  }
};


const generate = async (reportId) => {
  const report = await reportExportRepository.findById(reportId);
  if (!report) throw ApiError.notFound('Report not found');
  if (report.status === 'COMPLETED') return report;

  await reportExportRepository.updateStatus(reportId, 'PROCESSING');

  try {
    const userId = report.user;
    const filters = report.filters || {};

    let body;
    if (report.reportType === REPORT_TYPES.MONTHLY_SUMMARY) {
      body = await buildMonthlySummary(userId, filters);
    } else if (report.reportType === REPORT_TYPES.CATEGORY_BREAKDOWN) {
      body = await buildCategoryBreakdown(userId, filters);
    } else if (report.reportType === REPORT_TYPES.CASH_FLOW) {
      body = await buildCashFlow(userId, filters);
    } else {
      throw ApiError.badRequest(`Unsupported report type: ${report.reportType}`);
    }

    const buffer = serializeReport(report, body);

    const fakeFile = {
      originalname: report.fileName,
      mimetype:
        report.exportFormat === EXPORT_FORMATS.CSV
          ? 'text/csv'
          : report.exportFormat === EXPORT_FORMATS.XLSX
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf',
      size: buffer.length,
      buffer,
    };
    const fileMeta = await fileService.saveFile(fakeFile, {
      folder: 'reportExports',
    });

    await reportExportRepository.updateById(reportId, {
      storageKey: fileMeta.filePath,
      status: 'COMPLETED',
    });

    notificationService
      .create({
        user: userId,
        title: 'Report ready',
        message: `Your ${report.reportType
          .toLowerCase()
          .replace(/_/g, ' ')} report is ready to download.`,
        notificationType: NOTIFICATION_TYPES.SYSTEM,
        relatedEntity: { entityType: null, entityId: null },
      })
      .catch((err) => {
        logger.error('Failed to notify report ready', {
          reportId: String(reportId),
          error: err.message,
        });
      });

    return await reportExportRepository.findById(reportId);
  } catch (err) {
    logger.error('Report generation failed', {
      reportId: String(reportId),
      error: err.message,
    });
    await reportExportRepository.updateStatus(reportId, 'FAILED');
    throw err;
  }
};


const buildMonthlySummary = async (userId, filters) => {
  const { startDate, endDate } = filters;
  const currency = await userSettingsService.getPreferredCurrency(userId);

  const byType = await transactionService.summaryByType(userId, startDate, endDate);

  return {
    title: `Monthly Summary (${formatDate(startDate)} – ${formatDate(endDate)})`,
    sections: [
      {
        heading: 'Overview',
        rows: [
          ['Total income', formatCents(byType.INCOME.total, currency)],
          ['Income transactions', String(byType.INCOME.count)],
          ['Total expenses', formatCents(byType.EXPENSE.total, currency)],
          ['Expense transactions', String(byType.EXPENSE.count)],
          [
            'Net',
            formatCents(byType.INCOME.total - byType.EXPENSE.total, currency),
          ],
        ],
      },
    ],
  };
};

const buildCategoryBreakdown = async (userId, filters) => {
  const { startDate, endDate, transactionType } = filters;
  const currency = await userSettingsService.getPreferredCurrency(userId);

  const rows = await transactionService.summaryByCategory(
    userId,
    startDate,
    endDate,
    transactionType || null
  );

  const dataRows = rows.map((row) => [
    row.category?.name ?? 'Uncategorized',
    String(row.count),
    formatCents(row.total, currency),
  ]);

  return {
    title: `Category Breakdown (${formatDate(startDate)} – ${formatDate(endDate)})`,
    sections: [
      {
        heading: transactionType ? `${transactionType} by category` : 'By category',
        headers: ['Category', 'Transactions', 'Total'],
        rows: dataRows,
      },
    ],
  };
};

const buildCashFlow = async (userId, filters) => {
  const { startDate, endDate } = filters;
  const currency = await userSettingsService.getPreferredCurrency(userId);

  const byType = await transactionService.summaryByType(userId, startDate, endDate);
  const net = byType.INCOME.total - byType.EXPENSE.total;

  return {
    title: `Cash Flow (${formatDate(startDate)} – ${formatDate(endDate)})`,
    sections: [
      {
        heading: 'Cash flow',
        rows: [
          ['Money in', formatCents(byType.INCOME.total, currency)],
          ['Money out', formatCents(byType.EXPENSE.total, currency)],
          ['Net cash flow', formatCents(net, currency)],
          ['Status', net >= 0 ? 'Positive' : 'Negative'],
        ],
      },
    ],
  };
};


const serializeReport = (report, body) => {
  if (report.exportFormat === EXPORT_FORMATS.CSV) {
    return serializeCsv(body);
  }
  if (report.exportFormat === EXPORT_FORMATS.XLSX) {
    throw ApiError.badRequest(
      'XLSX export requires the exceljs library — install and wire it'
    );
  }
  return serializePdf(body);
};

const serializeCsv = (body) => {
  const lines = [];
  body.sections.forEach((section) => {
    lines.push(section.heading);
    if (section.headers) lines.push(section.headers.join(','));
    section.rows.forEach((row) => lines.push(row.map(csvEscape).join(',')));
    lines.push('');
  });
  return Buffer.from(lines.join('\n'), 'utf8');
};

const serializePdf = (body) => {
  const lines = [];
  body.sections.forEach((section) => {
    lines.push('');
    lines.push(`== ${section.heading} ==`);
    if (section.headers) lines.push(section.headers.join(' | '));
    section.rows.forEach((row) => lines.push(row.join(' | ')));
  });
  return buildPdf(body.title, lines);
};


const getById = async (reportId, userId) => {
  const report = await reportExportRepository.findByIdAndUser(reportId, userId);
  if (!report) throw ApiError.notFound('Report not found');

  if (report.status === 'COMPLETED') {
    return {
      ...report.toObject(),
      downloadUrl: fileService.buildPublicUrl(report.storageKey),
    };
  }
  return report;
};


const list = async (userId, options = {}) => {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(Math.max(1, parseInt(options.limit, 10) || 20), 100);

  const [items, total] = await Promise.all([
    reportExportRepository.findByUser(userId, { ...options, page, limit }),
    reportExportRepository.countByUser(userId, options),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};


const remove = async (reportId, userId) => {
  const report = await reportExportRepository.findByIdAndUser(reportId, userId);
  if (!report) throw ApiError.notFound('Report not found');

  if (report.storageKey) {
    try {
      await fileService.deleteFile(report.storageKey);
    } catch (err) {
      logger.warn('Failed to delete report file', {
        reportId: String(reportId),
        error: err.message,
      });
    }
  }

  await reportExportRepository.deleteByIdAndUser(reportId, userId);
  return { message: 'Report deleted' };
};


const processPending = async () => {
  const pending = await reportExportRepository.findPending();
  let processed = 0;
  let failed = 0;

  for (const report of pending) {
    try {
      await generate(report._id);
      processed++;
    } catch (err) {
      failed++;
      logger.error('Failed to process pending report', {
        reportId: String(report._id),
        error: err.message,
      });
    }
  }

  return { processed, failed, total: pending.length };
};


const dashboard = async (userId) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [byType, recentTransactions, activeBudgets, activeGoals] = await Promise.all([
    transactionService.summaryByType(userId, monthStart, monthEnd),
    transactionService.recent(userId, 5),
    budgetService.getActive(userId),
    savingsGoalService.list(userId, { status: GOAL_STATUSES.ACTIVE }),
  ]);

  return {
    period: { startDate: monthStart, endDate: monthEnd },
    income: byType.INCOME,
    expense: byType.EXPENSE,
    netCents: byType.INCOME.total - byType.EXPENSE.total,
    recentTransactions,
    activeBudgetsCount: activeBudgets.length,
    activeGoalsCount: activeGoals.length,
  };
};


const incomeExpense = async (userId, startDate, endDate) => {
  const byType = await transactionService.summaryByType(userId, startDate, endDate);
  return {
    startDate,
    endDate,
    income: byType.INCOME,
    expense: byType.EXPENSE,
    netCents: byType.INCOME.total - byType.EXPENSE.total,
  };
};


const categoryBreakdown = async (userId, startDate, endDate, transactionType = null) => {
  const items = await transactionService.summaryByCategory(
    userId,
    startDate,
    endDate,
    transactionType
  );
  return {
    startDate,
    endDate,
    transactionType: transactionType || null,
    items,
  };
};


const accountSummary = async (userId, accountId, startDate, endDate) => {
  const items = await transactionService.summaryByAccount(
    userId,
    accountId,
    startDate,
    endDate
  );
  return {
    accountId,
    startDate,
    endDate,
    items,
  };
};


const monthlySummary = async (userId, months = 6) => {
  const items = await transactionService.monthlyTotals(userId, months);
  return { months, items };
};


const cashFlow = async (userId, startDate, endDate) => {
  const byType = await transactionService.summaryByType(userId, startDate, endDate);
  const netCents = byType.INCOME.total - byType.EXPENSE.total;

  return {
    startDate,
    endDate,
    moneyIn: byType.INCOME.total,
    moneyOut: byType.EXPENSE.total,
    netCents,
    isPositive: netCents >= 0,
    transactionCount: byType.INCOME.count + byType.EXPENSE.count,
  };
};


const budgetPerformance = async (userId) => {
  const budgets = await budgetRepository.findActiveForDate(userId, new Date());

  const items = await Promise.all(
    budgets.map(async (budget) => {
      const spend = await budgetService.getSpend(budget, userId);
      const percentUsed =
        budget.amountCents > 0
          ? Math.round((spend.totalCents / budget.amountCents) * 100)
          : 0;

      return {
        budgetId: budget._id,
        name: budget.name,
        category: budget.category,
        amountCents: budget.amountCents,
        spentCents: spend.totalCents,
        remainingCents: Math.max(0, budget.amountCents - spend.totalCents),
        percentUsed,
        isOverBudget: spend.totalCents > budget.amountCents,
        isAlert: percentUsed >= budget.alertPercentage,
      };
    })
  );

  return { items };
};


const savingsProgress = async (userId) => {
  const goals = await savingsGoalService.list(userId, {
    status: GOAL_STATUSES.ACTIVE,
  });
  return { items: goals };
};


export default {
  
  createRequest,
  generate,
  getById,
  list,
  remove,
  processPending,
  
  dashboard,
  incomeExpense,
  categoryBreakdown,
  accountSummary,
  monthlySummary,
  cashFlow,
  budgetPerformance,
  savingsProgress,
};