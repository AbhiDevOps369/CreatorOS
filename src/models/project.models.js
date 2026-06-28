

import mongoose,{Schema} from "mongoose";

const projectSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        
        
    },
    clientId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Client",
        required:true
    },
    agencyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Agency",
        required:true
    },
    stage: {
        type: String,
        enum: ["created", "team_allocated", "footage_submitted", "footage_review", "editing", "edit_review", "delivered"],
        default: "created",
        required: true
    },
    approvalStatus: {
    type: String,
    enum: ["pending", "approved"],
    default: "approved",
    required: true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }

 

},{
    timestamps:true,
});

export const Project=mongoose.model("Project",projectSchema);