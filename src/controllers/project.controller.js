import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { Project } from "../models/project.models.js"
import { Membership } from "../models/projectMembership.models.js"
import { Client } from "../models/client.models.js"
import { checkAgencyOwnership } from "../utils/checkOwnership.js"

const createProject=asyncHandler(async(req,res)=>{
    const { name, description, clientId } = req.body
    const user=req.user;
    const role=req.membership.role;
    const client = await Client.findById(clientId)
    if (!client) throw new ApiError(404, "Client not found");

    checkAgencyOwnership(client, req.user.agencyId);

    const project=await Project.create({
    name,
    description,
    clientId,
    agencyId: req.user.agencyId,
    stage: "created",
    approvalStatus: role === "owner" ? "approved" : "pending",
    createdBy: req.user._id
    });

    await Membership.create({
    userId: req.user._id,
    projectId: project._id,
    role: role
    });

    const createdProject=await Project.findById(project._id);
    if (!createdProject) throw new ApiError(500, "Something went wrong creating project");
    return res.status(201).json(new ApiResponse(201,createdProject,"Project Created Successfully"));


});

const getAllProjects=asyncHandler(async(req,res)=>{
    const memberships=await Membership.find({userId:req.user._id});
    const projectIds=memberships.map(m=>m.projectId);
    const projects=await Project.find({
        _id:{$in:projectIds},
        agencyId:req.user.agencyId
    }); 


    return res.status(200).json(new ApiResponse(200,projects,"Success"));


});

const getProjectById=asyncHandler(async(req,res)=>{
    const {projectId}=req.params;
    const project=await Project.findById(projectId);

    checkAgencyOwnership(project,req.user.agencyId);

    return res.status(200).json(new ApiResponse(200,project,"Project retrieved successfully"));
});

const updateProject=asyncHandler(async(req,res)=>{
    const {projectId}=req.params;
    const {name,description}=req.body;
    const project=await Project.findById(projectId);

    checkAgencyOwnership(project,req.user.agencyId);

    if(name){
        project.name=name;
    }
    if(description){
        project.description=description;
    }

    await project.save();
    const updatedProject=await Project.findById(projectId);
    if(!updatedProject){
        throw new ApiError(500,"Internal Error in updation");
    }

    return res.status(200).json(new ApiResponse(200,updatedProject,"Project updated successfully"))
});

const deleteProject=asyncHandler(async(req,res)=>{
    const {projectId}=req.params;
    const project=await Project.findById(projectId);
    checkAgencyOwnership(project,req.user.agencyId);


    await Project.findByIdAndDelete(projectId);

    const deletedProject=await Project.findById(projectId);
    if(deletedProject){
        throw new ApiError(500,"Internal Error in deletion");
    }

    return res.status(200).json(new ApiResponse(200,{},"Project deleted successfully"))
    


});

const approveProject=asyncHandler(async(req,res)=>{
    const user=req.user;
    const {projectId}=req.params;
    const project=await Project.findById(projectId);
    if(!project){
        throw new ApiError(404,"No Project exists");
    }

    checkAgencyOwnership(project, user.agencyId);

    if (project.approvalStatus !== "pending") {
    throw new ApiError(422, "Project is not pending approval")
    }
    project.approvalStatus="approved";

    await project.save({validateBeforeSave:false});

    return res.status(200).json(new ApiResponse(200,project,"Successfully Approved"));
});

const allocateTeam = asyncHandler(async (req, res) => {
    const { projectId } = req.params
    const { teamAssignments } = req.body  // array of { userId, role, assignedAs }

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "No Project exists")

    checkAgencyOwnership(project, req.user.agencyId)

    const nextStage = canTransition(project.stage, "allocate-team", req.membership.role)
    if (!nextStage) throw new ApiError(422, "Illegal transition")

    for (const assignment of teamAssignments) {
        const existing = await Membership.findOne({ userId: assignment.userId, projectId })
        if (existing) continue
        await Membership.create({
            userId: assignment.userId,
            projectId,
            role: assignment.role,
            assignedAs: assignment.assignedAs || null
        })
    }

    project.stage = nextStage
    await project.save()

    return res.status(200).json(new ApiResponse(200, project, "Team allocated successfully"))
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

export {createProject,getAllProjects, updateProject,deleteProject,getProjectById,approveProject,allocateTeam,deliverProject}