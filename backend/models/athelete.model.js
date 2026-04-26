import mongoose from "mongoose";

const atheleteSchema =  new mongoose.Schema({
    name : {type: String, required: true},
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "User",
        required: true
    },
    assignedCoachId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coach',
        required: truncate
    },
    fitnessLevel : {type: String},
    goals: [{type: String}],
    weaknesses: [{type: String}],
    weight: {type: Number},
    competitionDate: {type: Date},
    dob: {type: Date},
},{
    timestamps: true
});

export const atheleteModel = mongoose.model('Athelete', atheleteSchema);