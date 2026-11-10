
import { reportService } from '../services/index.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';


export const createRequest = asyncHandler(async (req, res) => {
  const report = await reportService.createRequest(req.user.userId, req.body);
  res.status(202).json(
    new ApiResponse(202, { report }, 'Report queued for generation')
  );
});

export const getById = asyncHandler(async (req, res) => {
  const report = await reportService.getById(req.params.id, req.user.userId);
  res.status(200).json(
    new ApiResponse(200, { report }, 'Report retrieved')
  );
});

export const list = asyncHandler(async (req, res) => {
  const result = await reportService.list(req.user.userId, req.query);
  res.status(200).json(
    new ApiResponse(200, result, 'Reports retrieved')
  );
});

export const remove = asyncHandler(async (req, res) => {
  const result = await reportService.remove(req.params.id, req.user.userId);
  res.status(200).json(new ApiResponse(200, null, result.message));
});


export const dashboard = asyncHandler(async (req, res) => {
  const data = await reportService.dashboard(req.user.userId);
  res.status(200).json(
    new ApiResponse(200, data, 'Dashboard summary retrieved')
  );
});

export const incomeExpense = asyncHandler(async (req, res) => {
  const data = await reportService.incomeExpense(
    req.user.userId,
    req.query.startDate,
    req.query.endDate
  );
  res.status(200).json(
    new ApiResponse(200, data, 'Income vs expense retrieved')
  );
});

export const categoryBreakdown = asyncHandler(async (req, res) => {
  const data = await reportService.categoryBreakdown(
    req.user.userId,
    req.query.startDate,
    req.query.endDate,
    req.query.transactionType || null
  );
  res.status(200).json(
    new ApiResponse(200, data, 'Category breakdown retrieved')
  );
});

export const accountSummary = asyncHandler(async (req, res) => {
  const data = await reportService.accountSummary(
    req.user.userId,
    req.params.accountId,
    req.query.startDate,
    req.query.endDate
  );
  res.status(200).json(
    new ApiResponse(200, data, 'Account summary retrieved')
  );
});

export const monthlySummary = asyncHandler(async (req, res) => {
  const data = await reportService.monthlySummary(
    req.user.userId,
    req.query.months
  );
  res.status(200).json(
    new ApiResponse(200, data, 'Monthly summary retrieved')
  );
});

export const cashFlow = asyncHandler(async (req, res) => {
  const data = await reportService.cashFlow(
    req.user.userId,
    req.query.startDate,
    req.query.endDate
  );
  res.status(200).json(
    new ApiResponse(200, data, 'Cash flow retrieved')
  );
});

export const budgetPerformance = asyncHandler(async (req, res) => {
  const data = await reportService.budgetPerformance(req.user.userId);
  res.status(200).json(
    new ApiResponse(200, data, 'Budget performance retrieved')
  );
});

export const savingsProgress = asyncHandler(async (req, res) => {
  const data = await reportService.savingsProgress(req.user.userId);
  res.status(200).json(
    new ApiResponse(200, data, 'Savings progress retrieved')
  );
});