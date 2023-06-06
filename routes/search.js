const express = require("express");
const Post = require("./newpostSchema");
const User = require("./userSchema");
const router = express.Router();
const session = require("express-session");


router.post("/search", async (req, res) => {
    if(!req.session._id){
        res.redirect("/login");
    }
    const username = req.body.searchName;
    console.log(username);
    const search = await User.findOne({ UserName: username });
    if (!search) {
        res.render("errorPage", {code:"404", message:"NOT FOUND"})
    } else {
        const id = search._id;

        let year = new Date().getFullYear();
        if (id) {
            await Post.find({ Uploader: id })
                .sort({ CreatedAt: -1 })
                .then(posts => {
                    posts.forEach(post => {
                        post.ImageUrl = post.ImageUrl.replace(/\\/g, '/');
                        post.ImageUrl = post.ImageUrl.replace(/public\//, '');
                    });
                    res.render("gen-profile",
                        {
                            username,
                            year,
                            posts,
                            totalLikes: search.TotalLikes,
                            totalAwards: search.TotalAwards,
                            Bio: search.Bio
                        });
                })
                .catch(err => {
                    console.log(err);
                });
        } else {
            console.log("NOT LOGGED IN!");
            res.redirect("/login");
        }
    }

})


module.exports = router;