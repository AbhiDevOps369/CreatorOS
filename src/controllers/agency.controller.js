import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Agency } from "../models/agency.models.js";
import {User} from "../models/user.model.js";

const createAgency=asyncHandler(async(req,res)=>{
    const user=req.user;
    const {name}=req.body;
    if(user.agencyId){
        throw new ApiError(403,"Unauthorized access: Agency already assigned");
    }
    const agency=await Agency.create({name,owner:req.user._id});
    user.agencyId=agency._id;
    await user.save({validateBeforeSave:false});
    return res.status(201).json(new ApiResponse(201,agency,"Successfully created Agency"));
});