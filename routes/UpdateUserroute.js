const express = require("express");
const router = express.Router();
const session = require('express-session');

router.get("/Update", (req, res) => {
    if(!req.session._id){
        res.redirect("/login");
    }
    res.render("updateProfile",
        {
            username: req.session.username,
            totalLikes: req.session.totallikes,
            totalAwards: req.session.totalawards,
            Bio: req.session.bio,
            error: ""
        })
})

module.exports = router;