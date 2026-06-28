import mongoose,{Schema} from "mongoose";

const agencySchema=new Schema({
    name:{
        type:String,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{
    timestamps:true,
});

export const Agency = mongoose.model("Agency", agencySchema)