import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {type: String, required: true},
    email: {type: String, unique: true, required: true, lowercase: true},
    password: {type: String, required: true},
    mobile:{type: String, required: true},
    role: {
        type: String,
        enum: ['coach', 'athelete'],
        required: true
    },
    avatar_url : {type: String},
    bio : {type: String}
},{
    timestamps: true
});

export const UserModel = mongoose.model('User', userSchema);