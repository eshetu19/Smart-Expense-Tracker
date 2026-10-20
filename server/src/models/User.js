import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const userSchema = new mongoose.Schema(
  {
    username:{
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim:true,
      lowercase:true,
      minlenght: [3, "Username must be at least 3 characters long"],
      maxlenght: [50, "Username must be at most 50 characters long"],
      match: [
        /^[a-Z0-9_]+$/, "username can only contain letters, numbers and underscores"]
    },
    email:{
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim:true,
      lowercase:true,
      maxlenght:255,
      match: [/^\s+@\.\s+$/, "please provide a valid email"]
    },
    password:{
      type:String,
      required:[true,'password is required'],
      minlength:[8,'password must be atleast 8 character'],
      select:false
    },
    firstname:{
      type:String,
      required:[true,'firstname is required'],
      trim:true,
      maxlenght:100
    },
    lastname:{
      type:String,
      required:[true,'lastname is required'],
      trim:true,
      maxlenght:100
    },
    phoneNumber:{
      type:String,
      trim:true,
      unique:true,
      sparse:true,
      maxlenght:20
    },
    profileImage:{
      type:String,
      default:null,
      maxlenght:500
    },
    isEmailVerified:{
      type:Boolean,
      default:false
    },
    emailVerifiedAt:{
      type:Date,
      default:null
    },
    isActive:{
      type:Boolean,
      default:true
    },
    lastLoginAt:{
      type:Date,
      default:null  
    },

} ,
{
  timestamps:true,
  versionKey:false,
  toJSON: {virtuals:true},
  toObject: {virtuals:true}

}
);

userSchema.index({isActive:1})
userSchema.index({createdAt:-1})

userSchema.virtual('fullName').get(function(){
  return `${this.firstname} ${this.lastname}`.trim();
});

userSchema.virtual('initials').get(function(){
  const first=this.firstname?.[0]??''
  const last =this.lastname?.[0]??''
  return(first+last).toUpperCase()
});

userSchema.methods.comparePassword = async function(candidatePassword){
  return  bcrypt.compare(candidatePassword, this.password);
}

userSchema.methods.markEmailVerified = function(){
  this.isEmailVerified = true;
  this.emailVerifiedAt = new Date();
  
}

userSchema.methods.updateLastLogin = function(){
  this.lastLoginAt = new Date();
}

userSchema.statics.findByEmail =  function(email){
  return this.findOne({email:email.toLowerCase().trim()});
}

userSchema.statics.findByUsername = function(username){
  return this.findOne({username:username.toLowerCase().trim()});
}

userSchema.pre('save',async function name() {
  if(!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
})

const User = mongoose.model('User', userSchema);

export default User;