import {Client} from "../models/client.models.js";
import { Project } from "../models/project.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Task } from "../models/task.models.js";

const loginClient = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        throw new ApiError(400, "email and password are required")
    }

    const client = await Client.findOne({ email })
    if (!client) {
        throw new ApiError(400, "client does not exist !")
    }

    const passResult = await client.isPasswordCorrect(password)
    if (!passResult) {
        throw new ApiError(400, "Invalid credentials!")
    }

    const accessToken = client.generateAccessToken()
    const refreshToken = client.generateRefreshToken()
    client.refreshToken = refreshToken
    await client.save({ validateBeforeSave: false })

    const loggedClient = await Client.findById(client._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                client: loggedClient,
                accessToken, refreshToken
            },
            "Client logged in successfully")
        )
});

const logoutClient = asyncHandler(async (req, res) => {
    await Client.findByIdAndUpdate(
        req.client._id,
        { $set: { refreshToken: "" } },
        { new: true }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Client logged out"))
});

const getCurrentClient = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.client, "Current client fetched successfully"))
});

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

export {getClientProjectById,getClientProjects,loginClient,logoutClient,getCurrentClient}