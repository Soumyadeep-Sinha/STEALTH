const express = require("express");
const session = require("cookie-session");

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
    req.session = null
    if(!req.session){
        res.redirect('/login');
    }else{
        res.send("failed to destroy cookie data");
    }
})

module.exports = router;