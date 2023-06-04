const express = require("express");
const router = express.Router();
const session = require('express-session');
const User = require("./userSchema")

router.post("/UpdateUser", async (req, res) => {
    let oldPassword = req.body.oldpwd;
    const search = await User.findOne({ _id: req.session._id }); 
    const retrievedpwd = search.Password;

    if (retrievedpwd === oldPassword) {
        await User.findById(search._id)
            .then(async (document) => {
                if (document) {
                    if(!req.body.upusername){
                        document.UserName = search.UserName;
                    }else{
                        document.UserName = req.body.upusername;
                    }

                    if(!req.body.upbio){
                        document.Bio = search.Bio;
                    }else{
                        document.Bio = req.body.upbio;
                    }

                    if(!req.body.newpwd){
                        document.Password = search.Password;
                    }else{
                        document.Password = req.body.newpwd;
                    }

                    await document.save()
                        .then(() => {
                            res.redirect("/logout");
                        }).catch(error => {
                            console.log(error);
                            res.render("updateProfile",
                                {
                                    username: req.session.username,
                                    totalLikes: req.session.totallikes,
                                    totalAwards: req.session.totalawards,
                                    Bio: req.session.bio,
                                    error: "username not available"
                                })
                        })
                } else {
                    res.render("updateProfile",
                        {
                            username: req.session.username,
                            totalLikes: req.session.totallikes,
                            totalAwards: req.session.totalawards,
                            Bio: req.session.bio,
                            error: "record not found"
                        })
                }
            })
            .catch((err) => {
                console.log(err);
                console.log("Cannot update record");
            });
    } else {
        res.render("updateProfile",
            {
                username: search.UserName,
                totalLikes: search.TotalLikes,
                totalAwards: search.TotalAwards,
                Bio: search.Bio,
                error: "Wrong Credentials!"
            })
        // res.redirect("/Update");
    }
})

module.exports = router;