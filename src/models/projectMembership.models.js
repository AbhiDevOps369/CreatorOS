import mongoose, { Schema } from "mongoose";

const projectMembershipSchema=new Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    projectId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Project",
        required:true
    },
    role:{
        type:String,
        enum:["owner","manager","contributor","reviewer"],
        required:true
    },
    assignedAs:{
        type:String,
        trim: true
    }
},{
    timestamps:true
});
projectMembershipSchema.index(
    { userId: 1, projectId: 1 }, 
    { unique: true }
)
export const Membership=mongoose.model("Membership",projectMembershipSchema);