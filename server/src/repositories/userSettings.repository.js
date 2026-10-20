import UserSettings from '../models/UserSettings.js'

const findByUser=(userId)=>UserSettings.findOne({user:userId})

const findById=(id)=>UserSettings.findById(id)

const existsByUser=async(userId)=>{
    const count=await UserSettings.countDocuments({user:userId})

    return count > 0

}

const create=(data)=>UserSettings.create(data)

const save=(settings)=>settings.save()

const updateByUser=(userId,data)=>
    UserSettings.findOneAndUpdate(
        {user:userId},
        data,
        {new:true,runValidators:true}
    )

const upSertByUser=(userId,data)=>
    UserSettings.findOneAndUpdate(
        {user:userId},{$set:data},{new:true,upsert:true,runValidators:true
            ,setDefaultsOnInsert: true
        }

    )

const deeleteByUser=(userId)=>UserSettings.findOneAndDelete(userId)


export default{
  findByUser,
  findById,
  existsByUser,
  create,
  save,
  updateByUser,
  upsertByUser,
  deleteByUser,
}