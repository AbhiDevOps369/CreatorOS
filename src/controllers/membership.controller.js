import { Membership } from "../models/projectMembership.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { checkAgencyOwnership } from "../utils/checkOwnership.js";
import {User} from "../models/user.model.js";
import { Project } from "../models/project.models.js"
const addMember=asyncHandler(async(req,res)=>{
    const {userId,role,assignedAs}=req.body;
    const {projectId}=req.params;

    const existingMembership = await Membership.findOne({ userId, projectId })
    if (existingMembership) {
        throw new ApiError(409, "User is already a member of this project")
    }
    //integrity check
    const user=await User.findById(userId);

    checkAgencyOwnership(user, req.user.agencyId);


    const membership=await Membership.create({
        userId:userId,
        projectId:projectId,
        role:role,
        assignedAs:assignedAs ? assignedAs:null

    });

    return res.status(201).json(new ApiResponse(201,membership,"Created Successfully"));
});

const getMember=asyncHandler(async(req,res)=>{
    const {projectId}=req.params;
    const project=await Project.findById(projectId);
    checkAgencyOwnership(project, req.user.agencyId);
    const members=await Membership.find({projectId:projectId});

    return res.status(200).json(new ApiResponse(200, members, "Members in your project"))
});

const updateMemberRole=asyncHandler(async(req,res)=>{
    const {role,assignedAs}=req.body;
    const {userId}=req.params;

    const user=await User.findById(userId);
    checkAgencyOwnership(user,req.user.agencyId);
    const membership=await Membership.findOne({userId:userId});
    if(!membership){
        throw new ApiError(404,"No membership for this user available ");
    }
    if(role){
        membership.role=role;
    }
    if(assignedAs){
        membership.assignedAs=assignedAs;
    }

    await membership.save();

    const updatedMembership=await Membership.findById(membership._id);
    if(!updatedMembership){
        throw new ApiError(500,"Internal server error in updation ");
    }

    return res.status(200).json(new ApiResponse(200,updatedMembership,"Updated successfully"));
});

const deleteMember=asyncHandler(async(req,res)=>{
    const {projectId,userId}=req.params;

    const membership=await Membership.findOne({userId,projectId});

    if(!membership){
        throw new ApiError(404,"No membership for this user available ");
    }
    const user=await User.findById(userId);

    checkAgencyOwnership(user,user.agencyId);

    await Membership.findByIdAndDelete(membership._id);

    const deletedMembership=await Membership.findById(membership._id);

    if(deletedMembership){
        throw new ApiError(500,"Internal server error in deletion ");
    }

    return res.status(200).json(new ApiResponse(200,{},"Deleted successfully"));
});

export {addMember,getMember,updateMemberRole,deleteMember}