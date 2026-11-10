
import mongoose from 'mongoose';
import connectDB, { disconnectDB } from '../config/database.js';
import Category from '../models/Category.js';
import { TRANSACTION_TYPES } from '../config/constants.js';
import logger from '../utils/logger.js';


const SYSTEM_CATEGORIES = [
 
  { name: 'Food & Dining',   transactionType: TRANSACTION_TYPES.EXPENSE, icon: 'utensils',        color: '#F87171' },
  { name: 'Groceries',       transactionType: TRANSACTION_TYPES.EXPENSE, icon: 'shopping-basket', color: '#FB923C' },
  { name: 'Transport',       transactionType: TRANSACTION_TYPES.EXPENSE, icon: 'car',             color: '#FBBF24' },
  { name: 'Rent',            transactionType: TRANSACTION_TYPES.EXPENSE, icon: 'home',            color: '#A78BFA' },
  { name: 'Utilities',       transactionType: TRANSACTION_TYPES.EXPENSE, icon: 'zap',             color: '#60A5FA' },
  { name: 'Internet & Phone',transactionType: TRANSACTION_TYPES.EXPENSE, icon: 'wifi',            color: '#38BDF8' },
  { name: 'Healthcare',      transactionType: TRANSACTION_TYPES.EXPENSE, icon: 'heart',           color: '#F472B6' },
  { name: 'Education',       transactionType: TRANSACTION_TYPES.EXPENSE, icon: 'book',            color: '#818CF8' },
  { name: 'Entertainment',   transactionType: TRANSACTION_TYPES.EXPENSE, icon: 'music',           color: '#C084FC' },
  { name: 'Shopping',        transactionType: TRANSACTION_TYPES.EXPENSE, icon: 'shopping-bag',    color: '#F0ABFC' },
  { name: 'Clothing',        transactionType: TRANSACTION_TYPES.EXPENSE, icon: 'shirt',           color: '#FBCFE8' },
  { name: 'Personal Care',   transactionType: TRANSACTION_TYPES.EXPENSE, icon: 'sparkles',        color: '#FDA4AF' },
  { name: 'Gifts & Donations',transactionType: TRANSACTION_TYPES.EXPENSE, icon: 'gift',           color: '#FDA4AF' },
  { name: 'Travel',          transactionType: TRANSACTION_TYPES.EXPENSE, icon: 'plane',           color: '#34D399' },
  { name: 'Insurance',       transactionType: TRANSACTION_TYPES.EXPENSE, icon: 'shield',          color: '#93C5FD' },
  { name: 'Taxes',           transactionType: TRANSACTION_TYPES.EXPENSE, icon: 'file-text',       color: '#9CA3AF' },
  { name: 'Other Expense',   transactionType: TRANSACTION_TYPES.EXPENSE, icon: 'circle',          color: '#9CA3AF' },

  
  { name: 'Salary',          transactionType: TRANSACTION_TYPES.INCOME,  icon: 'briefcase',       color: '#10B981' },
  { name: 'Freelance',       transactionType: TRANSACTION_TYPES.INCOME,  icon: 'laptop',          color: '#22D3EE' },
  { name: 'Business Income', transactionType: TRANSACTION_TYPES.INCOME,  icon: 'trending-up',     color: '#4ADE80' },
  { name: 'Investments',     transactionType: TRANSACTION_TYPES.INCOME,  icon: 'line-chart',      color: '#34D399' },
  { name: 'Gifts Received',  transactionType: TRANSACTION_TYPES.INCOME,  icon: 'gift',            color: '#A3E635' },
  { name: 'Refunds',         transactionType: TRANSACTION_TYPES.INCOME,  icon: 'rotate-ccw',      color: '#84CC16' },
  { name: 'Other Income',    transactionType: TRANSACTION_TYPES.INCOME,  icon: 'circle',          color: '#9CA3AF' },
];



const seedSystemCategories = async () => {
  let inserted = 0;
  let skipped = 0;

  for (const cat of SYSTEM_CATEGORIES) {
    const existing = await Category.findOne({
      user: null,
      isSystem: true,
      name: cat.name,
      transactionType: cat.transactionType,
    });

    if (existing) {
      skipped++;
      continue;
    }

    await Category.create({
      user: null,
      isSystem: true,
      isActive: true,
      ...cat,
    });
    inserted++;
  }

  return { inserted, skipped, total: SYSTEM_CATEGORIES.length };
};

const run = async () => {
  try {
    await connectDB();
    logger.info('Starting seed script');

    const result = await seedSystemCategories();
    logger.info('System categories seeded', result);

    logger.info('Seed complete', {
      categoriesInserted: result.inserted,
      categoriesSkipped: result.skipped,
    });
  } catch (err) {
    logger.error('Seed script failed', {
      error: err.message,
      stack: err.stack,
    });
    process.exitCode = 1;
  } finally {
    await disconnectDB();
    process.exit();
  }
};

run();