const express = require("express");
const session = require('express-session');
const Post = require("./newpostSchema")

const router = express.Router();

router.get("/home", async (req, res) => {
    const username = req.session.username;
    const bio = req.session.bio;
    const totallikes = req.session.totallikes;
    const totalawards = req.session.totalawards;
    const userID = req.session._id;

    let year = new Date().getFullYear();
    if (username) {
        // randomly select posts/ function of MongoDB
        await Post.aggregate([
            { $sample: { size: 100 } }, // Adjust the size as needed
        ])
            .then(posts => {
                posts.forEach(post => {
                    post.ImageUrl = post.ImageUrl.replace(/\\/g, '/');
                    post.ImageUrl = post.ImageUrl.replace(/public\//, '');
                });
                res.render("home", { username, userID, totallikes, totalawards,  bio, year, posts });
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