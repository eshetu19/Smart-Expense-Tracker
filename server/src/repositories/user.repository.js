import User from '../models/User.js'

const findById=(id)=>User.findById(id)

const findByEmail=(email)=>
    User.findOne({email:email.toLowerCase().trim()})

const findByIdWithPassword = (id) =>
  User.findById(id).select('+password');

const findByUsername=(username)=>
    User.findOne({username:username.toLowerCase().trim()})

const findByEmailWithPassword=(email)=>
    User.findOne({email:email.toLowerCase().trim()}).select('+password')

const findByEmailOrUsername=(identifier)=>{
    const normalized=identifier.toLowerCase().trim()
    return User.findOne({
        $or:[{email:normalized},{username:normalized}]
    })
}

const existsByEmail=async(email)=>{
    const count=await User.countDocuments({
        email:email.toLowerCase().trim()
    })
    return count > 0
}

const existsByUsername = async (username) => {
  const count = await User.countDocuments({
    username: username.toLowerCase().trim(),
  });
  return count > 0;
};

const existsByPhoneNumber = async (phoneNumber) => {
  const count = await User.countDocuments({ phoneNumber });
  return count > 0;
};

const createData=(data)=>User.create(data)

const save=(user)=>User.save();
    
const updateById=(id,date)=>
    User.findByIdAndUpdate(id,date,{new: true, runValidators: true })

const updateLastLogin = (id) =>
  User.findByIdAndUpdate(
    id,
    { lastLoginAt: new Date() },
    { new: true, runValidators: true }
  );

const markEmailVerified = (id) =>
  User.findByIdAndUpdate(
    id,
    { isEmailVerified: true, emailVerifiedAt: new Date() },
    { new: true, runValidators: true }
  );

const updatePassword = async (id, newPassword) => {
  const user = await User.findById(id);
  if (!user) return null;
  user.password = newPassword;
  await user.save();
  return user;
};

const deactivate = (id) =>
  User.findByIdAndUpdate(id, { isActive: false }, { new: true, runValidators: true });

const deleteById = (id) => User.findByIdAndDelete(id);


export default {
 
  findById,
  findByEmail,
  findByUsername,
  findByEmailWithPassword,
  findByEmailOrUsername,
  existsByEmail,
  existsByUsername,
  existsByPhoneNumber,
  findByIdWithPassword,
  createData,
  save,
  updateById,
  updateLastLogin,
  markEmailVerified,
  updatePassword,
  deactivate,
  
  deleteById,
};