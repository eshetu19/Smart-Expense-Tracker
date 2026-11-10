
import categoryRepository from '../repositories/category.repository.js';
import transactionRepository from '../repositories/transaction.repository.js';
import ApiError from '../utils/ApiError.js';
import { LIMITS, TRANSACTION_TYPES } from '../config/constants.js';


const create = async (userId, data) => {
  
  const count = await categoryRepository.countUserOnly(userId);
  if (count >= LIMITS.MAX_CATEGORIES_PER_USER) {
    throw ApiError.badRequest(
      `Maximum of ${LIMITS.MAX_CATEGORIES_PER_USER} custom categories allowed`
    );
  }

  
  const existing = await categoryRepository.findByNameTypeAndUser(
    data.name,
    data.transactionType,
    userId
  );
  if (existing) {
    throw ApiError.conflict(
      `You already have a ${data.transactionType.toLowerCase()} category named "${data.name}"`
    );
  }

  
  return await categoryRepository.create({
    user: userId,
    name: data.name.trim(),
    transactionType: data.transactionType,
    icon: data.icon ?? null,
    color: data.color ?? null,
    isSystem: false,
    isActive: true,
  });
};


const getById = async (categoryId, userId) => {
  const category = await categoryRepository.findByIdAndUser(categoryId, userId);
  if (!category) throw ApiError.notFound('Category not found');
  return category;
};

const list = async (userId, options = {}) => {
  const { transactionType } = options;

  if (transactionType) {
    return await categoryRepository.findByUserAndType(userId, transactionType);
  }

  return await categoryRepository.findByUser(userId);
};


const update = async (categoryId, userId, data) => {
  const category = await categoryRepository.findByIdAndUser(categoryId, userId);
  if (!category) throw ApiError.notFound('Category not found');

  
  if (category.isSystem) {
    throw ApiError.forbidden('System categories cannot be modified');
  }

  
  const allowedFields = ['name', 'icon', 'color'];
  const updates = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  }

  
  if (updates.name && updates.name !== category.name) {
    const existing = await categoryRepository.findByNameTypeAndUser(
      updates.name,
      category.transactionType,
      userId
    );
    if (existing && existing._id.toString() !== category._id.toString()) {
      throw ApiError.conflict(
        `You already have a ${category.transactionType.toLowerCase()} category named "${updates.name}"`
      );
    }
  }

  return await categoryRepository.updateById(categoryId, updates);
};

const deactivate = async (categoryId, userId) => {
  const category = await categoryRepository.findByIdAndUser(categoryId, userId);
  if (!category) throw ApiError.notFound('Category not found');

  if (category.isSystem) {
    throw ApiError.forbidden('System categories cannot be deactivated');
  }

  if (!category.isActive) {
    return { message: 'Category already inactive' };
  }

  await categoryRepository.deactivate(categoryId);
  return { message: 'Category deactivated' };
};

  const activate = async (categoryId, userId) => {
  const category = await categoryRepository.findByIdAndUser(categoryId, userId);
  if (!category) throw ApiError.notFound('Category not found');

  if (category.isSystem) {
    throw ApiError.forbidden('System categories cannot be activated/deactivated');
  }

  if (category.isActive) {
    return { message: 'Category already active' };
  }

  await categoryRepository.activate(categoryId);
  return { message: 'Category activated' };
};

const remove = async (categoryId, userId) => {
  const category = await categoryRepository.findByIdAndUser(categoryId, userId);
  if (!category) throw ApiError.notFound('Category not found');

  
  if (category.isSystem) {
    throw ApiError.forbidden('System categories cannot be deleted');
  }

  
  const txCount = await transactionRepository.countByCategory(categoryId);
  if (txCount > 0) {
    throw ApiError.conflict(
      `Cannot delete category: ${txCount} transaction(s) reference it. ` +
        'Deactivate the category instead, or delete those transactions first.'
    );
  }

  await categoryRepository.deleteById(categoryId);
  return { message: 'Category deleted' };
};

const checkOwnership = async (categoryId, userId) => {
  const category = await categoryRepository.findByIdAndUser(categoryId, userId);
  if (!category) throw ApiError.notFound('Category not found');
  return category;
};

const checkTypeCompatible = async (categoryId, transactionType, userId) => {
  if (!categoryId) return null; // uncategorized is allowed

  const category = await checkOwnership(categoryId, userId);

  if (category.transactionType !== transactionType) {
    throw ApiError.badRequest(
      `Category "${category.name}" is for ${category.transactionType}, not ${transactionType}`
    );
  }

  if (!category.isActive) {
    throw ApiError.badRequest(
      `Category "${category.name}" is deactivated`
    );
  }

  return category;
};

export default {
  create,
  getById,
  list,
  update,
  deactivate,
  activate,
  remove,
  checkOwnership,
  checkTypeCompatible,
};