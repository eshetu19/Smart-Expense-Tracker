import accountRepository from '../repositories/account.repository.js';
import transactionRepository from '../repositories/transaction.repository.js';
import userSettingsRepository from '../repositories/userSettings.repository.js';
import ApiError from '../utils/ApiError.js';
import { LIMITS } from '../config/constants.js';

const create = async (userId , data) => {
    const count = accountRepository.countByUser(userId)
    if(count >= LIMITS.MAX_ACCOUNTS_PER_USER){
         throw ApiError.badRequest(
      `Maximum of ${LIMITS.MAX_ACCOUNTS_PER_USER} accounts allowed`
       );
    }

const existing = await accountRepository.findByNameAndUser(data.name, userId)
if (existing) {
    throw ApiError.conflict(`You already have an account named "${data.name}"`);
  }
   const openingCents = data.openingBalanceCents ?? 0;


   const account = await accountRepository.create({
    user: userId,
    name: data.name.trim(),
    accountType: data.accountType,
    openingBalanceCents: openingCents,
    currentBalanceCents: openingCents,
    currency: data.currency,
    color: data.color ?? null,
    icon: data.icon ?? null,
    isActive: true,
  });
  return account ;
}


const getById = async (accountId , userId) => {
    const account = await accountRepository.findByIdAndUser(accountId , userId)

    if (!account) throw ApiError.notFound('Account not found');
    return account;
}

const list = async (userId , options={})=> {
    const { includeInactive = false } = options;
    return includeInactive
    ? await accountRepository.findByUser(userId)
    : await accountRepository.findActiveByUser(userId);
}

const update = async (accountId , userId , data) => {
    const account = await accountRepository.findByIdAndUser(accountId , userId)
    if(!account) throw ApiError.notFound('Account not found.')

    const allowedFields = ['name', 'accountType', 'color', 'icon', 'currency']
    const updates = {}

    for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = data[field];
     }
    }
     if (updates.name && updates.name !== account.name) {
    const existing = await accountRepository.findByNameAndUser(
      updates.name,
      userId
    );
    if (existing && existing._id.toString() !== account._id.toString()) {
      throw ApiError.conflict(
        `You already have an account named "${updates.name}"`
      );
    }
   } 
   return await accountRepository.updateById(accountId, updates);
}

const deactivate = async (accountId , userId) => {
    const account = await accountRepository.findByIdAndUser(accountId,userId)
    if(!account) throw ApiError.notFound('Account not found')

     if (!account.isActive) {
    return { message: 'Account already inactive' };
  }

  await accountRepository.deactivate(accountId);
  return { message: 'Account deactivated' };
}

const activate = async (accountId, userId) => {
  const account = await accountRepository.findByIdAndUser(accountId, userId);
  if (!account) throw ApiError.notFound('Account not found');

  if (account.isActive) {
    return { message: 'Account already active' };
  }

  await accountRepository.activate(accountId);
  return { message: 'Account activated' };
};


const remove = async (accountId , userId) => {
    const account = accountRepository.findByIdAndUser(accountId , userId)
    if(!account) throw ApiError.notFound('Account not found')
    
    const txCount = await transactionRepository.countByAccount(accountId)
    if(txCount >0){
        throw ApiError.conflict(
      `Cannot delete account: ${txCount} transaction(s) reference it. ` +
        'Deactivate the account instead, or delete those transactions first.'
       );
    }
    const settings = await userSettingsRepository.findByUser(userId)
    if (settings?.defaultAccountId?.equals(accountId)) {
    throw ApiError.conflict(
      'Cannot delete account: it is set as your default account. ' +
        'Change your default account first.'
    );
  }
  await accountRepository.deleteById(accountId);
  return { message: 'Account deleted' };
}

const adjustBalance = async (accountId , deltaCents , userId = null) => {
    if (userId) {
    const account = await accountRepository.findByIdAndUser(accountId, userId);
    if (!account) throw ApiError.notFound('Account not found');
    }

    const updated = await accountRepository.incrementBalance(
    accountId,
    deltaCents
  );
  if (!updated) throw ApiError.notFound('Account not found');
  return updated;
};
//why this shi* do i need it 
const checkOwnership = async (accountId , userId) => {
    const account = await accountRepository.findByIdAndUser(accountId, userId);
    if (!account) throw ApiError.notFound('Account not found');
    return account;
}


export default {
  create,
  getById,
  list,
  update,
  deactivate,
  activate,
  remove,
  adjustBalance,
  checkOwnership,
};


