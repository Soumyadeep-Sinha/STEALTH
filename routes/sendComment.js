const express = require("express");
const router = express.Router();
const Post = require("./newpostSchema")
const session = require('express-session');
const User = require("./userSchema");

router.post('/sendComment/:id', async (req, res) => {
    const id = req.params.id;
    await Post.findById(id)
    .then(async (post) => {
        console.log(req.body.newComment)
        post.Comments.push(req.body.newComment);
        await post.save();
        console.log("post saved");
        res.redirect("/home");
    }).catch(error => {
        console.log(error);
    })
});

module.exports = router;