import mongoose,{Schema} from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

const clientSchema=new Schema({
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
    agencyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Agency",
        required:true
    },

    //auth attributes

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
    timestamps:true,
});


//hook

clientSchema.pre("save",async function(){
    if(!this.isModified("password")) return;
    this.password=await bcrypt.hash(this.password,12);
});

//methods

clientSchema.methods.generateAccessToken=function(){
    return jwt.sign(
    {
        _id:this.id,
        name:this.name,
        email:this.email
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}  //what does it do? -> automatically starts timer and when jwt.verify() called it checks it it has expired , if yes no db call needed
)
};

clientSchema.methods.generateRefreshToken=function(){
        return jwt.sign({
            _id:this.id,
            name:this.name,
            email:this.email, 
    
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
    )
};

clientSchema.methods.generateTemporaryTokens=function(){
        const unHashedToken=crypto.randomBytes(20).toString('hex');
    
        const hashedToken=crypto.createHash('sha256').update(unHashedToken).digest('hex');
    
        const tokenExpiry=Date.now() + (20*60*1000);
    
        return {unHashedToken,hashedToken,tokenExpiry};
};

clientSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password);  
};
export const Client=mongoose.model("Client",clientSchema);