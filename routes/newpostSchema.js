const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new mongoose.Schema({
    Uploader: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    UploaderName: { type: String, required: true },
    Caption: { type: String, required: true },
    ImageUrl: { type: String, required: true },
    FileName: { type: String, required: true },
    Likes: { type: Number, default: 0 },
    Dislikes: { type: Number, default: 0 },
    Awards: { type: Number, default: 0 },
    CreatedAt: { type: Date, default: Date.now },
    LikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    DislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    AwardedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    IPAddress: {type:String},
    Location: {type:String},
})

module.exports = mongoose.model('Post', postSchema);