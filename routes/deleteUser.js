const express = require("express");
const router = express.Router();
const session = require('express-session');
const User = require("./userSchema");

router.get("/deleteUser", async (req, res) => {
    await User.findByIdAndRemove(req.session._id)
        .then(() => {
            console.log("user deleted");
            res.redirect("/logout");
        })
        .catch((err) => {
            console.log("cannot delete user", err);
        });
})

module.exports = router;