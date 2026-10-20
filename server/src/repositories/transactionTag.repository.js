import TransactionTag from '../models/TransactionTag.js'

const findByTransaction=(transactionId)=>
    TransactionTag.find({transaction:transactionId}).populate(
        'tag','name color'
    )

const findByTag=(tagId)=>
    TransactionTag.find({tag:tagId}).populate('transaction')

const findTagIdsByTransaction=async(transactionId)=>{
    const links= await TransactionTag.find({transaction:transactionId})
    .select('tag')
    return links.map((l)=>l.tag)
}

const  existsByTransactionAndTag=async(transactionId,tagId)=>{
     const count = await TransactionTag.countDocuments({
    transaction: transactionId,
    tag: tagId,
  });
  return count > 0;
}

const create = (transactionId, tagId) =>
  TransactionTag.create({ transaction: transactionId, tag: tagId });

const createMany = (links) => TransactionTag.insertMany(links);

const deleteByTransactionAndTag = (transactionId, tagId) =>
  TransactionTag.findOneAndDelete({
    transaction: transactionId,
    tag: tagId,
  });

  const deleteAllByTransaction = (transactionId) =>
  TransactionTag.deleteMany({ transaction: transactionId });

const deleteAllByTag = (tagId) =>
  TransactionTag.deleteMany({ tag: tagId });


export default {
  findByTransaction,
  findByTag,
  findTagIdsByTransaction,
  existsByTransactionAndTag,
  create,
  createMany,
  deleteByTransactionAndTag,
  deleteAllByTransaction,
  deleteAllByTag,
};