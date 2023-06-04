const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    UserName: { type: String, unique:true ,required: true },
    Password: { type: String, required: true },
    Bio: { type: String, default: "THIS IS A SAMPLE BIO YOU CAN UPDATE IT." },
    TotalLikes: { type: Number, default: 0 },
    TotalAwards: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', userSchema);