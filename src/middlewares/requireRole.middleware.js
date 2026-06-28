import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Membership } from "../models/projectMembership.models.js";


export const requireRole=(...roles)=>{
    return asyncHandler(async(req,res,next)=>{



        //find project id
        const projectId=req.params.projectId;

        //check if even user exists

        const membership=await Membership.findOne({
            userId:req.user._id,
            projectId
        });


        if(!membership){
            throw new ApiError(403,"Unauthorized Access");
        }
        //find user role
        const userRole=membership.role;

        //check if user role matches with allowable roles

        if(!roles.includes(userRole)){
            throw new ApiError(403,"Unauthorized access");
        }

        
        //attach membership

        req.membership=membership;
        next();


})
};