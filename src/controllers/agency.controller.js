import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Agency } from "../models/agency.models.js";
import {User} from "../models/user.model.js";
import {emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail} from "../utils/mail.js";
import crypto from 'crypto';

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


const inviteMember=asyncHandler(async(req,res)=>{
    const {email}=req.body;
    const user=await User.findOne({email});

    if(!user){
        throw new ApiError(404,"No user exists");
    }

    if(user.agencyId){
        throw new ApiError(403,"User already assigned to agency");
    }

    const {unHashedToken,hashedToken,tokenExpiry}= user.generateTemporaryTokens();

    user.AgencyVerificationExpiry=tokenExpiry;
    user.AgencyVerificationToken=hashedToken;
    user.pendingAgencyId=req.user.agencyId;
    await user.save({validateBeforeSave:false});

    await sendEmail({
            email:user?.email,
            subject:"Please Accept Invitation to agency",
            mailgenContent:emailVerificationMailgenContent(user.name,`${req.protocol}://${req.get("host")}/api/v1/agencies/accept-invite/${unHashedToken}`)
    });

    return res.status(200).json(new ApiResponse(200,{},"invite email sent"));


});

const acceptMember=asyncHandler(async(req,res)=>{
    const {unHashedToken}=req.params;

    if(!unHashedToken){
            throw new ApiError(400,"Email Verification failed")
    }
    
    let hashedToken=crypto
        .createHash('sha256')
        .update(unHashedToken)
        .digest("hex")

    const user=await User.findOne({
        AgencyVerificationToken:hashedToken,
        AgencyVerificationExpiry:{$gt:Date.now()}
    });

    if(!user){
        throw new ApiError(400,"token expired or invalid");
    }

    user.agencyId=user.pendingAgencyId;
    user.pendingAgencyId=undefined;
    user.AgencyVerificationExpiry=undefined;
    user.AgencyVerificationToken=undefined;
    await user.save({validateBeforeSave:false});

    return res.status(200).json(
        new ApiResponse(
            200,{},
            "Joined Agency"
        )
    );
});
const getAgencyMembers=asyncHandler(async(req,res)=>{
    if(!req.user.agencyId){
        throw new ApiError(403,"You are not part of an agency");
    }
    const members=await User.find({agencyId:req.user.agencyId}).select("name email jobTitle");
    return res.status(200).json(new ApiResponse(200,members,"Agency members fetched successfully"));
});

export {createAgency,inviteMember,acceptMember,getAgencyMembers}