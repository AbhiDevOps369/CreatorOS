import mongoose,{Schema} from "mongoose";

const noteSchema=new Schema({
    content:{
        type:String,
        required:true
    },
    projectId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Project",
        required:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    acknowledgedBy:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }]

},{
    timestamps:true,
});

export const Note=mongoose.model("Note",noteSchema);