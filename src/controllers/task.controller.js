import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { canTransition } from "../utils/pipeline/stateMachine.js";
import { Project } from "../models/project.models.js";
import {Task} from "../models/task.models.js";
import { checkAgencyOwnership } from "../utils/checkOwnership.js";
import { Subtask } from "../models/subtask.models.js"

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

    project.stage = nextState; 
    task.attachments.push({ url, message });
    await task.save();
    await project.save();
    return res.status(200).json(new ApiResponse(200,{},"Success"));

});

const approveFootage = asyncHandler(async (req, res) => {
    const { taskId } = req.params

    const task = await Task.findById(taskId)
    if (!task) throw new ApiError(404, "Task not found")

    const project = await Project.findById(task.projectId)
    if (!project) throw new ApiError(404, "Project not found")

    checkAgencyOwnership(project, req.user.agencyId)

    const nextStage = canTransition(project.stage, "approve-footage", req.membership.role)
    if (!nextStage) {
        throw new ApiError(422, "Illegal transition")
    }

    project.stage = nextStage
    await project.save()

    return res.status(200).json(new ApiResponse(200, project, "Footage approved"))
});

const rejectFootage=asyncHandler(async(req,res)=>{
    const {taskId}=req.params;

    const task=await Task.findById(taskId);

    if (!task) throw new ApiError(404, "Task not found")

    const project=await Project.findById(task.projectId);

    if (!project) throw new ApiError(404, "Project not found")

    checkAgencyOwnership(project,req.user.agencyId);

    const nextStage=canTransition(project.stage,"reject-footage",req.membership.role);

    if(!nextStage) throw new ApiError(422,"Illegal Transition for current state");

    project.stage=nextStage;

    await project.save();

    return res.status(200).json(new ApiResponse(200, project, "Footage rejected"))
});

const createTask=asyncHandler(async(req,res)=>{
    const {title,description, assignedTo}=req.body;
    const {projectId}=req.params;

    const project=await Project.findById(projectId);

    if(!project){
        throw new ApiError(404,"no project exists");
    }

    checkAgencyOwnership(project,req.user.agencyId);

    const task = await Task.create({
        title,
        description,
        projectId,
        assignedTo,
        createdBy: req.user._id
    });


    const createdTask=await Task.findById(task._id);

    if(!createdTask){
        throw new ApiError(500,"Internal server Error while creation");
    }

    return res.status(201).json(new ApiResponse(201,createdTask,"Success"));
});

const getAllTasks=asyncHandler(async(req,res)=>{
    const {projectId}=req.params;
    const project=await Project.findById(projectId);

    if(!project){
        throw new ApiError(404,"no project exists");
    }

    checkAgencyOwnership(project,req.user.agencyId);

    const tasks=await Task.find({projectId:projectId});

    res.status(200).json(new ApiResponse(200, tasks, "Tasks retrieved successfully"));

});

const getTaskById=asyncHandler(async(req,res)=>{
    const { projectId, taskId } = req.params

    // Basic checks : project?,agencyId<->project?, project<->task?
    const project=await Project.findById(projectId);

    if(!project){
        throw new ApiError(404,"no project exists");
    }

    checkAgencyOwnership(project,req.user.agencyId);

    const task = await Task.findById(taskId);
    if (!task) throw new ApiError(404, "Task not found");

    if(task.projectId.toString() !== projectId){
        throw new ApiError(403,"Unauthorized access")
    }

    return res.status(200).json(new ApiResponse(200,task,"Success"));
});

const updateTask=asyncHandler(async(req,res)=>{
    const {projectId,taskId}=req.params;
    const {title,description}=req.body;
     // Basic checks : project?,agencyId<->project?, project<->task?
    const project=await Project.findById(projectId);

    if(!project){
        throw new ApiError(404,"no project exists");
    }

    checkAgencyOwnership(project,req.user.agencyId);

    const task = await Task.findById(taskId);
    if (!task) throw new ApiError(404, "Task not found");

    if(task.projectId.toString() !== projectId){
        throw new ApiError(403,"Unauthorized access")
    }

    if(title){
        task.title=title;
    }
    if(description){
        task.description=description;
    }
   

    await task.save();

    const updatedTask=await Task.findById(task._id);

    if(!updatedTask){
        throw new ApiError(500,"Internal Server Error for updation");
    }

    return res.status(200).json(new ApiResponse(200,updatedTask,"Successfully Updated"));


});

const deleteTask=asyncHandler(async(req,res)=>{
    const {projectId,taskId}=req.params;
    // Basic checks : project?,agencyId<->project?, project<->task?
    const project=await Project.findById(projectId);

    if(!project){
        throw new ApiError(404,"no project exists");
    }

    checkAgencyOwnership(project,req.user.agencyId);

    const task = await Task.findById(taskId);
    if (!task) throw new ApiError(404, "Task not found");

    if(task.projectId.toString() !== projectId){
        throw new ApiError(403,"Unauthorized access")
    }

    await Task.findByIdAndDelete(taskId);

    const deletedTask=await Task.findById(taskId);

    if(deletedTask){
        throw new ApiError(500,"Internal Server Error")
    }
    return res.status(200).json(new ApiResponse(200,{},"Successfully Deleted"));

});

const submitEdit=asyncHandler(async(req,res)=>{
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

    const incompleteSubtasks = await Subtask.find({ 
        taskId, 
        isCompleted: false 
    })
    if (incompleteSubtasks.length > 0) {
        throw new ApiError(422, "All subtasks must be completed before submitting edit")
    }


    const nextStage=canTransition(project.stage,"submit-edit",req.membership.role);
    if (!nextStage) throw new ApiError(422, "Illegal transition")

    project.stage=nextStage;

    await project.save();

    task.attachments.push({ url, message });

    await task.save();
    return res.status(200).json(new ApiResponse(200, task, "Edit submitted successfully"));
});

const approveEdit=asyncHandler(async(req,res)=>{
    const {taskId} = req.params;

    const task=await Task.findById(taskId);
    if (!task) throw new ApiError(404, "Task not found")
    const project=await Project.findById(task.projectId);
    if (!project) throw new ApiError(404, "Project not found")
    checkAgencyOwnership(project,req.user.agencyId);

    const nextStage=canTransition(project.stage,"approve-edit",req.membership.role);
    if (!nextStage) {
        throw new ApiError(422, "Illegal transition")
    }

    project.stage = nextStage
    project.editApproved = true;  
    await project.save()

    return res.status(200).json(new ApiResponse(200, project, "Edit approved"));
});

const rejectEdit=asyncHandler(async(req,res)=>{
  const {taskId} = req.params;

    const task=await Task.findById(taskId);
    if (!task) throw new ApiError(404, "Task not found")
    const project=await Project.findById(task.projectId);
    if (!project) throw new ApiError(404, "Project not found")
    checkAgencyOwnership(project,req.user.agencyId);

    const nextStage = canTransition(project.stage, "request-changes", req.membership.role);
    if (!nextStage) throw new ApiError(422, "Illegal transition");

    project.stage = nextStage;
    project.editApproved = false; 
    await project.save();

    return res.status(200).json(new ApiResponse(200, project, "Changes requested"));
});

const deliverProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "No Project exists")

    checkAgencyOwnership(project, req.user.agencyId)

    if (project.stage !== "edit_review" || !project.editApproved) {
        throw new ApiError(422, "Edit must be approved before delivery")
    }

    const nextStage = canTransition(project.stage, "deliver", req.membership.role)
    if (!nextStage) throw new ApiError(422, "Illegal transition")

    project.stage = nextStage
    await project.save()

    return res.status(200).json(new ApiResponse(200, project, "Project delivered successfully"))
});
export {submitFootage,approveFootage,rejectFootage,createTask,getAllTasks,getTaskById,updateTask,deleteTask,submitEdit,approveEdit,rejectEdit,deliverProject}