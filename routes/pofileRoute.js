const express = require("express");
const session = require('express-session');
const Post = require("./newpostSchema")

const router = express.Router();

router.get("/profile", async (req, res) => {
    const username = req.session.username;
    const id = req.session._id;
    let year = new Date().getFullYear();
    if (req.session._id) {
        await Post.find({ Uploader: req.session._id })
            .sort({ CreatedAt: -1 })
            .then(posts => {
                posts.forEach(post => {
                    post.ImageUrl = post.ImageUrl.replace(/\\/g, '/');
                    post.ImageUrl = post.ImageUrl.replace(/public\//, '');
                });
                res.render("profilePage",
                    {
                        username,
                        year,
                        posts,
                        totalLikes: req.session.totallikes,
                        totalAwards: req.session.totalawards,
                        Bio: req.session.bio
                    });
            })
            .catch(err => {
                console.log(err);
            });
    } else {
        console.log("NOT LOGGED IN!");
        res.redirect("/login");
    }
})


module.exports = router;