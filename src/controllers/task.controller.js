import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { canTransition } from "../utils/pipeline/stateMachine.js";
import { Project } from "../models/project.models.js";
import {Task} from "../models/task.models.js";
import { checkAgencyOwnership } from "../utils/checkOwnership.js";

const submitFootage=asyncHandler(async(req,res)=>{
    const {url,message}=req.body;
    const {taskId}=req.params;

    const task=await Task.findById(taskId);
    if(!task){
        throw new ApiError(404,"no task found");
    }
    const project=await Project.findById(task.projectId);
    if(!project){
        throw new ApiError(404,"no project found");
    }
    checkAgencyOwnership(project, req.user.agencyId);
    const nextState=canTransition(project.stage,"submit-footage",req.membership.role);

    if(!nextState){
        throw new ApiError(422, "Illegal transition — cannot submit footage from current stage");
    }

    project.stage = "footage_review"; //auto advance
    task.attachments.push({ url, message });
    await task.save();
    await project.save();
    return res.status(200).json(new ApiResponse(200,{},"Success"));

});