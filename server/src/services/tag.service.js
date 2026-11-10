
import tagRepository from '../repositories/tag.repository.js';
import transactionTagRepository from '../repositories/transactionTag.repository.js';
import ApiError from '../utils/ApiError.js';
import { LIMITS } from '../config/constants.js';


const create = async (userId, data) => {
  
  const count = await tagRepository.countByUser(userId);
  if (count >= LIMITS.MAX_TAGS_PER_USER) {
    throw ApiError.badRequest(
      `Maximum of ${LIMITS.MAX_TAGS_PER_USER} tags allowed`
    );
  }

  
  const normalizedName = data.name.trim();
  const existing = await tagRepository.findByNameAndUser(normalizedName, userId);
  if (existing) {
    throw ApiError.conflict(`You already have a tag named "${normalizedName}"`);
  }

  
  return await tagRepository.create({
    user: userId,
    name: normalizedName,
    color: data.color ?? null,
  });
};


const getById = async (tagId, userId) => {
  const tag = await tagRepository.findByIdAndUser(tagId, userId);
  if (!tag) throw ApiError.notFound('Tag not found');
  return tag;
};

const list = async (userId) => {
  return await tagRepository.findByUser(userId);
};


const update = async (tagId, userId, data) => {
  const tag = await tagRepository.findByIdAndUser(tagId, userId);
  if (!tag) throw ApiError.notFound('Tag not found');

  const allowedFields = ['name', 'color'];
  const updates = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = field === 'name' ? data[field].trim() : data[field];
    }
  }

 
  if (updates.name && updates.name !== tag.name) {
    const existing = await tagRepository.findByNameAndUser(updates.name, userId);
    if (existing && !existing._id.equals(tag._id)) {
      throw ApiError.conflict(`You already have a tag named "${updates.name}"`);
    }
  }

  return await tagRepository.updateById(tagId, updates);
};


const remove = async (tagId, userId) => {
  const tag = await tagRepository.findByIdAndUser(tagId, userId);
  if (!tag) throw ApiError.notFound('Tag not found');

  
  await transactionTagRepository.deleteAllByTag(tagId);

 
  await tagRepository.deleteById(tagId);

  return { message: 'Tag deleted' };
};


const checkOwnership = async (tagId, userId) => {
  const tag = await tagRepository.findByIdAndUser(tagId, userId);
  if (!tag) throw ApiError.notFound('Tag not found');
  return tag;
};


const resolveOrCreate = async (userId, input) => {
  if (!input || input.length === 0) return [];

  
  if (input.length > LIMITS.MAX_TAGS_PER_TRANSACTION) {
    throw ApiError.badRequest(
      `Maximum of ${LIMITS.MAX_TAGS_PER_TRANSACTION} tags per transaction`
    );
  }

 
  const isObjectId = (value) => /^[a-fA-F0-9]{24}$/.test(value);

  const idStrings = input.filter(isObjectId);
  const nameStrings = input.filter((v) => !isObjectId(v));

  
  let tagsById = [];
  if (idStrings.length > 0) {
    tagsById = await tagRepository.findByIdsAndUser(idStrings, userId);
    if (tagsById.length !== idStrings.length) {
      throw ApiError.badRequest('One or more tag IDs are invalid');
    }
  }

  
  let tagsByName = [];
  if (nameStrings.length > 0) {
    
    const normalizedNames = [
      ...new Set(nameStrings.map((n) => n.trim()).filter(Boolean)),
    ];

    if (normalizedNames.length > 0) {
      
      const existing = await tagRepository.findByNamesAndUser(
        normalizedNames,
        userId
      );
      const existingByName = new Map(
        existing.map((t) => [t.name.toLowerCase(), t])
      );

      
      const missingNames = normalizedNames.filter(
        (n) => !existingByName.has(n.toLowerCase())
      );

      
      if (missingNames.length > 0) {
        
        const totalAfter =
          (await tagRepository.countByUser(userId)) + missingNames.length;
        if (totalAfter > LIMITS.MAX_TAGS_PER_USER) {
          throw ApiError.badRequest(
            `Cannot create tags: would exceed the limit of ${LIMITS.MAX_TAGS_PER_USER}`
          );
        }

        const created = await tagRepository.createMany(
          missingNames.map((name) => ({ user: userId, name }))
        );
        created.forEach((t) => existingByName.set(t.name.toLowerCase(), t));
      }

      tagsByName = normalizedNames.map((n) => existingByName.get(n.toLowerCase()));
    }
  }

  
  const allTags = [...tagsById, ...tagsByName];
  const uniqueIds = [];
  const seen = new Set();

  for (const tag of allTags) {
    const idStr = tag._id.toString();
    if (!seen.has(idStr)) {
      seen.add(idStr);
      uniqueIds.push(tag._id);
    }
  }

  return uniqueIds;
};


export default {
  create,
  getById,
  list,
  update,
  remove,
  checkOwnership,
  resolveOrCreate,
};