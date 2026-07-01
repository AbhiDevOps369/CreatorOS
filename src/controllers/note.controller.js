import { Project } from "../models/project.models.js";
import { Note } from "../models/note.models.js";
import { checkAgencyOwnership } from "../utils/checkOwnership.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createNote = asyncHandler(async (req, res) => {
    const { projectId } = req.params
    const { content } = req.body

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "No Project exists")

    checkAgencyOwnership(project, req.user.agencyId)

    const note = await Note.create({
        content,
        projectId,
        createdBy: req.user._id
    })

    const createdNote = await Note.findById(note._id)
    if (!createdNote) throw new ApiError(500, "Internal Server Error")

    return res.status(201).json(new ApiResponse(201, createdNote, "Success"))
})

const getNotes = asyncHandler(async (req, res) => {
    const { projectId } = req.params

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "Project does not exist")

    checkAgencyOwnership(project, req.user.agencyId)

    const notes = await Note.find({ projectId })

    return res.status(200).json(new ApiResponse(200, notes, "Success"))
})

const getNoteById = asyncHandler(async (req, res) => {
    const { noteId, projectId } = req.params

    const note = await Note.findById(noteId)
    if (!note) throw new ApiError(404, "Note does not exist")

    if (note.projectId.toString() !== projectId) {
        throw new ApiError(403, "Note does not belong to this Project")
    }

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "Project does not exist")

    checkAgencyOwnership(project, req.user.agencyId)

    return res.status(200).json(new ApiResponse(200, note, "Success"))
})

const updateNote = asyncHandler(async (req, res) => {
    const { noteId, projectId } = req.params
    const { content } = req.body

    const note = await Note.findById(noteId)
    if (!note) throw new ApiError(404, "Note does not exist")

    if (note.projectId.toString() !== projectId) {
        throw new ApiError(403, "Note does not belong to this Project")
    }

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "Project does not exist")

    checkAgencyOwnership(project, req.user.agencyId)

    
    const isAuthor = note.createdBy.toString() === req.user._id.toString()
    const isOwnerOrManager = ["owner", "manager"].includes(req.membership.role)
    if (!isAuthor && !isOwnerOrManager) {
        throw new ApiError(403, "Only the author or owner/manager can edit this note")
    }

    if (content) note.content = content

    await note.save()

    const updatedNote = await Note.findById(noteId)
    if (!updatedNote) throw new ApiError(500, "Internal Server Error")

    return res.status(200).json(new ApiResponse(200, updatedNote, "Successfully updated"))
})

const deleteNote = asyncHandler(async (req, res) => {
    const { noteId, projectId } = req.params

    const note = await Note.findById(noteId)
    if (!note) throw new ApiError(404, "Note does not exist")

    if (note.projectId.toString() !== projectId) {
        throw new ApiError(403, "Note does not belong to this Project")
    }

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "Project does not exist")

    checkAgencyOwnership(project, req.user.agencyId)

    const isAuthor = note.createdBy.toString() === req.user._id.toString()
    const isOwnerOrManager = ["owner", "manager"].includes(req.membership.role)
    if (!isAuthor && !isOwnerOrManager) {
        throw new ApiError(403, "Only the author or owner/manager can delete this note")
    }

    await Note.findByIdAndDelete(noteId)

    return res.status(200).json(new ApiResponse(200, {}, "Successfully deleted"))
})

const acknowledgeNote = asyncHandler(async (req, res) => {
    const { noteId, projectId } = req.params

    const note = await Note.findById(noteId)
    if (!note) throw new ApiError(404, "Note does not exist")

    if (note.projectId.toString() !== projectId) {
        throw new ApiError(403, "Note does not belong to this Project")
    }

    const project = await Project.findById(projectId)
    if (!project) throw new ApiError(404, "Project does not exist")

    checkAgencyOwnership(project, req.user.agencyId)

    const updatedNote = await Note.findByIdAndUpdate(
        noteId,
        { $addToSet: { acknowledgedBy: req.user._id } },
        { new: true }
    )

    return res.status(200).json(new ApiResponse(200, updatedNote, "Note acknowledged"))
})

export { createNote, getNotes, getNoteById, updateNote, deleteNote, acknowledgeNote }