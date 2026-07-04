import mongoose,{Schema} from "mongoose";
import crypto from "crypto"
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const userSchema=new Schema({
    //logical attributes
    name:{
        type:String,
        trim:true,
        required:true,
    },
    password:{
        type:String,
        trim:true,
        required:true,
    },
    email:{
        type:String,
        trim:true,
        required:true,
        unique:true,
    },
    isEmailVerified:{
        type:Boolean
    },
    jobTitle:{
        type:String,
        trim:true,
        required:true
    },
    agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agency",
    },

    //business attributes

    refreshToken:{
        type:String
    },
    forgotPasswordToken:{
        type:String,
    },
    forgotPasswordExpiry:{
        type:Date
    },
    emailVerificationToken:{
        type:String,
        
    },
    emailVerificationExpiry:{
        type:Date
    }
   
},{
    timestamps:true
},);



//hook
userSchema.pre("save",async function(){
    if(!this.isModified("password")) return;

    this.password=await bcrypt.hash(this.password,12);
});
//methods
userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this.id,
            name:this.name,
            email:this.email,     

        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
    )
};

userSchema.methods.generateRefreshToken=function(){
    return jwt.sign({
        _id:this.id,
        name:this.name,
        email:this.email, 

    },
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
)
};

userSchema.methods.generateTemporaryTokens=function(){
    const unHashedToken=crypto.randomBytes(20).toString('hex');

    const hashedToken=crypto.createHash('sha256').update(unHashedToken).digest('hex');

    const tokenExpiry=Date.now() + (20*60*1000);

    return {unHashedToken,hashedToken,tokenExpiry};
};

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password);  //plain password,hashed syntax
};


export const User=mongoose.model("User",userSchema);