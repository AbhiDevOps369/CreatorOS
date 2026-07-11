import {Client} from "../models/client.models.js";
import { Project } from "../models/project.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Task } from "../models/task.models.js";

const getClientProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find({ clientId: req.client._id })
        .select("name stage createdAt") 

    return res.status(200).json(new ApiResponse(200, projects, "Success"))
});

const getClientProjectById = asyncHandler(async (req, res) => {
    const { projectId } = req.params

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "Project not found")

   
    if (project.clientId.toString() !== req.client._id.toString()) {
        throw new ApiError(403, "Access denied")
    }

   
    const tasks = await Task.find({ projectId }).select("attachments")
    const deliverables = tasks.flatMap(task => task.attachments)

    return res.status(200).json(new ApiResponse(200, {
        name: project.name,
        stage: project.stage,
        deliverables
    }, "Success"))
});

export {getClientProjectById,getClientProjects}