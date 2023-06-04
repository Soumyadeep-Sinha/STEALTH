const express = require("express");
const session = require("express-session");

const router = express.Router();

router.get("/", (req,res)=> {
    res.render("Main");
})

router.get("/login", (req, res) => {
    res.render("login", { error: "", username: "" })
})

router.get("/register", (req, res) => {
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