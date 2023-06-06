const express = require("express");
const session = require("express-session");

const router = express.Router();

router.get("/", (req,res)=> {
    res.render("Main");
})

router.get("/login", (req, res) => {
    if(req.session._id){
        res.redirect("/home");
    }
    res.render("login", { error: "", username: "" })
})

router.get("/register", (req, res) => {
    if(req.session._id){
        res.redirect("/home");
    }
    res.render("signup", { error: "", username: "" })
})

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('Failed to destroy session: ', err);
        } else {
            console.log('Session destroyed successfully.');
        }
        res.redirect('/login');
    })
})

module.exports = router;