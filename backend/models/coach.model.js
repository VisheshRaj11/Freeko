import mongoose from "mongoose";

const coachSchema = new mongoose.Schema({
    name : {type: String, required: true},
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "User",
        required: true
    },
    specialization : {type: String},
    certifications : [{type: String}],
    exprienceYrs : {type: Number},
},{
    timestamps: true
});

export const CoachModel = mongoose.model('Coach', coachSchema);