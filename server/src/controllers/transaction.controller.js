
import { transactionService } from '../services/index.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';


export const create = asyncHandler(async (req, res) => {
  const transaction = await transactionService.create(
    req.user.userId,
    req.body
  );
  res.status(201).json(
    new ApiResponse(201, { transaction }, 'Transaction created')
  );
});


export const getById = asyncHandler(async (req, res) => {
  const transaction = await transactionService.getById(
    req.params.id,
    req.user.userId
  );
  res.status(200).json(
    new ApiResponse(200, { transaction }, 'Transaction retrieved')
  );
});


export const list = asyncHandler(async (req, res) => {
  const result = await transactionService.list(req.user.userId, req.query);
  res.status(200).json(
    new ApiResponse(200, result, 'Transactions retrieved')
  );
});


export const update = asyncHandler(async (req, res) => {
  const transaction = await transactionService.update(
    req.params.id,
    req.user.userId,
    req.body
  );
  res.status(200).json(
    new ApiResponse(200, { transaction }, 'Transaction updated')
  );
});


export const remove = asyncHandler(async (req, res) => {
  const result = await transactionService.remove(
    req.params.id,
    req.user.userId
  );
  res.status(200).json(new ApiResponse(200, null, result.message));
});


export const recent = asyncHandler(async (req, res) => {
  const transactions = await transactionService.recent(
    req.user.userId,
    req.query.limit
  );
  res.status(200).json(
    new ApiResponse(200, { transactions }, 'Recent transactions retrieved')
  );
});


export const byAccount = asyncHandler(async (req, res) => {
  const transactions = await transactionService.byAccount(
    req.params.accountId,
    req.user.userId
  );
  res.status(200).json(
    new ApiResponse(200, { transactions }, 'Transactions retrieved')
  );
});


export const byCategory = asyncHandler(async (req, res) => {
  const transactions = await transactionService.byCategory(
    req.params.categoryId,
    req.user.userId,
    req.query
  );
  res.status(200).json(
    new ApiResponse(200, { transactions }, 'Transactions retrieved')
  );
});


export const byDateRange = asyncHandler(async (req, res) => {
  const transactions = await transactionService.byDateRange(
    req.user.userId,
    req.query.startDate,
    req.query.endDate,
    req.query.status ? { status: req.query.status } : {}
  );
  res.status(200).json(
    new ApiResponse(200, { transactions }, 'Transactions retrieved')
  );
});


export const summaryByType = asyncHandler(async (req, res) => {
  const summary = await transactionService.summaryByType(
    req.user.userId,
    req.query.startDate,
    req.query.endDate
  );
  res.status(200).json(new ApiResponse(200, { summary }, 'Summary retrieved'));
});


export const summaryByCategory = asyncHandler(async (req, res) => {
  const items = await transactionService.summaryByCategory(
    req.user.userId,
    req.query.startDate,
    req.query.endDate,
    req.query.transactionType || null
  );
  res.status(200).json(
    new ApiResponse(200, { items }, 'Category summary retrieved')
  );
});


export const summaryByAccount = asyncHandler(async (req, res) => {
  const items = await transactionService.summaryByAccount(
    req.user.userId,
    req.params.accountId,
    req.query.startDate,
    req.query.endDate
  );
  res.status(200).json(
    new ApiResponse(200, { items }, 'Account summary retrieved')
  );
});


export const monthlyTotals = asyncHandler(async (req, res) => {
  const items = await transactionService.monthlyTotals(
    req.user.userId,
    req.query.months
  );
  res.status(200).json(
    new ApiResponse(200, { items }, 'Monthly totals retrieved')
  );
});