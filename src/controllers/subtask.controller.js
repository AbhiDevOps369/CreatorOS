import { Subtask } from "../models/subtask.models.js";
import { Task } from "../models/task.models.js";
import { Project } from "../models/project.models.js";
import {User} from "../models/user.model.js";
import { checkAgencyOwnership } from "../utils/checkOwnership.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createSubtask=asyncHandler(async(req,res)=>{
    const {taskId,projectId}=req.params
    const {title}=req.body;
    const task=await Task.findById(taskId);
    if(!task){
        throw new ApiError(404,"No Task exists");
    }

    const project=await Project.findById(projectId);
    if(!project){
        throw new ApiError(404,"No Project exists");
    }

    checkAgencyOwnership(project,req.user.agencyId);

    if(task.projectId.toString() !== projectId){
        throw new ApiError(403, "Task does not belong to this project");
    }

    const subtask=await Subtask.create({
            title,
            taskId,
            isCompleted:false,
            createdBy:req.user._id
        }
    );

    const createdSubtask=await Subtask.findById(subtask._id);

    if(!createdSubtask){
        throw new ApiError(500,"Internal Server Error ");
    }

    return res.status(201).json(new ApiResponse(201,createdSubtask,"Success"));

});


const getSubtaskById=asyncHandler(async(req,res)=>{
    const {subtaskId,taskId,projectId}=req.params;

    const subtask=await Subtask.findById(subtaskId);

    if(!subtask){
        throw new ApiError(404,"subtask does not exist");
    }

    const task=await Task.findById(taskId);

    if(!task){
        throw new ApiError(404,"Task does not exist");
    }

    if(subtask.taskId.toString() !== taskId){
        throw new ApiError(403,"Subtask does not belong to this Task");
    }

    const project=await Project.findById(projectId);

    if(!project){
        throw new ApiError(404,"Project does not exist");
    }

    if(task.projectId.toString() !== projectId){
        throw new ApiError(403,"Task does not belong to this Project");
    }

    checkAgencyOwnership(project,req.user.agencyId);

    return res.status(200).json(new ApiResponse(200,subtask,"Success"));
});

const getSubtasks=asyncHandler(async(req,res)=>{
    const {taskId,projectId}=req.params;

    const task=await Task.findById(taskId);

    if(!task){
        throw new ApiError(404,"Task does not exist");
    }

   

    const project=await Project.findById(projectId);

    if(!project){
        throw new ApiError(404,"Project does not exist");
    }

    if(task.projectId.toString() !== projectId){
        throw new ApiError(403,"Task does not belong to this Project");
    }

    checkAgencyOwnership(project,req.user.agencyId);

    const subtasks = await Subtask.find({ taskId: taskId });


    return res.status(200).json(new ApiResponse(200,subtasks,"Success"));
});

const updateSubtask=asyncHandler(async(req,res)=>{
    const {subtaskId,taskId,projectId}=req.params;
    const {title,isCompleted}=req.body;
    const subtask=await Subtask.findById(subtaskId);

    if(!subtask){
        throw new ApiError(404,"subtask does not exist");
    }

    const task=await Task.findById(taskId);

    if(!task){
        throw new ApiError(404,"Task does not exist");
    }

    if(subtask.taskId.toString() !== taskId){
        throw new ApiError(403,"Subtask does not belong to this Task");
    }

    const project=await Project.findById(projectId);

    if(!project){
        throw new ApiError(404,"Project does not exist");
    }

    if(task.projectId.toString() !== projectId){
        throw new ApiError(403,"Task does not belong to this Project");
    }

    checkAgencyOwnership(project,req.user.agencyId);

    if(title){
        subtask.title=title;
    }
    if (typeof isCompleted === "boolean") {
        subtask.isCompleted = isCompleted;
    }
    await subtask.save();

    const updatedSubtask=await Subtask.findById(subtaskId);

    if(!updatedSubtask){
        throw new ApiError(500,"Internal Server Error");
    }

    return res.status(200).json(new ApiResponse(200,updatedSubtask,"Successfully updated"));
});

const deleteSubtask=asyncHandler(async(req,res)=>{
    const {subtaskId,taskId,projectId}=req.params;

    const subtask=await Subtask.findById(subtaskId);

    if(!subtask){
        throw new ApiError(404,"subtask does not exist");
    }

    const task=await Task.findById(taskId);

    if(!task){
        throw new ApiError(404,"Task does not exist");
    }

    if(subtask.taskId.toString() !== taskId){
        throw new ApiError(403,"Subtask does not belong to this Task");
    }

    const project=await Project.findById(projectId);

    if(!project){
        throw new ApiError(404,"Project does not exist");
    }

    if(task.projectId.toString() !== projectId){
        throw new ApiError(403,"Task does not belong to this Project");
    }

    checkAgencyOwnership(project,req.user.agencyId);

    await Subtask.findByIdAndDelete(subtaskId);

    const deletedSubtask=await Subtask.findById(subtaskId);

    if(deletedSubtask){
        throw new ApiError(500,"Internal Server Error");
    }

    return res.status(200).json(new ApiResponse(200,{},"Successfully deleted"));

});
export {createSubtask,getSubtaskById,getSubtasks,updateSubtask,deleteSubtask}