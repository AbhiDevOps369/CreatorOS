import { User } from "../models/user.model.js";
import { Client } from "../models/client.models.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  jwt  from "jsonwebtoken";


export const verifyJwt=(role = "user")=>{
    return asyncHandler(async(req,res,next)=>{

        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        if(!token){
            throw new ApiError(401,"Unauthorized User");
        }
        
        try {
            const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
            if(role === "client"){
                const client=await Client.findById(decodedToken._id).select("-password -emailVerificationToken -refreshToken -emailVerificationExpiry ");
                if (!client) throw new ApiError(401, "Unauthorized User") 
                req.client=client;
                next();
            }else{
                const user= await User.findById(decodedToken._id).select("-password -emailVerificationToken -refreshToken -emailVerificationExpiry ");
                if (!user) throw new ApiError(401, "Unauthorized User")
                req.user=user;
                next();
            }

        } catch (error) {
            throw new ApiError(401,"Unauthorized User",error);
        }
        


    })
}



