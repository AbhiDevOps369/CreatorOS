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


export {createProject}