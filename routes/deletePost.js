const express = require("express");
const fs = require("fs");
const Post = require("./newpostSchema")

const router = express.Router();

router.get("/delete/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            console.log("Post not found");
        }
        // Delete the file
        fs.unlinkSync('public/uploads/' + post.FileName);
        await Post.findByIdAndRemove(req.params.id);

        res.redirect("/profile");
    } catch (err) {
        console.log("Cannot delete post", err);
    }
})

module.exports = router;