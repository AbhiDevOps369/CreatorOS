import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    status: {
        type: String,
        enum: ["todo", "in_progress", "done"],
        default: "todo",
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    attachments: [
        {
            url: {
                type: String,
                required: true
            },
            message: {
                type: String
            }
        }
    ]
}, {
    timestamps: true
});

export const Task = mongoose.model("Task", taskSchema);