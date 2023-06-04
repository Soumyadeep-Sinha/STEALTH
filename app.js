const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const geoip = require('geoip-lite');
require("dotenv").config();

const port = 3000;

const app = express();

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// initializer
app.use(bodyParser.json({ limit: '25mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '25mb', extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

const locale = "mongodb://localhost:27017/stealthDB";
const uri = process.env.CONNECTOR;

// CONNECTION
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("successfully connected to your MongoDB database."))
    .catch((error) => { 
        console.log(error)
        res.render("errorPage", {code:"503", message: "SERVICE UNAVAILABLE"}); })


const authRoute = require("./routes/auth");
const homeroute = require("./routes/home");
const updateroute = require("./routes/UpdateUserroute");

app.use(authRoute);
app.use(homeroute);
app.use(updateroute);

// const userdata = new mongoose.Schema({
//     UserName: { type: String, required: true },
//     Password: { type: String, required: true },
//     Bio: { type: String, default: "THIS IS A SAMPLE BIO YOU CAN UPDATE IT." },
//     TotalLikes: { type: Number, default: 0 },
//     TotalAwards: { type: Number, default: 0 }
// });

// const userinputs = new mongoose.model("userDatas", userdata);

const User = require("./routes/userSchema")

// AUTHORIZATION
app.post("/register", async (req, res) => {
    const maindata = new User({
        UserName: req.body.username,
        Password: req.body.password,
        Bio: "THIS IS A SAMPLE BIO YOU CAN UPDATE IT.",
        TotalLikes: 0,
        TotalAwards: 0
    });

    const username = req.session.req.body.username;

    if (req.body.password === req.body.confpassword) {
        await maindata.save()
            .then(() => {
                console.log("User data saved successfully");
                res.render("login", { error: "", username: username })
            })
            .catch(error => {
                var error_name = "User already registered";
                console.log(error_name);
                console.log(error);
                res.render("signup", { error: "User already registered", username: username })
            });
    } else {
        console.log("password did not match")
        res.render("signup", { error: "Passwords don't match!", username: username })
    }
});


app.post("/login", async (req, res) => {
    try {
        let username = req.body.username;
        let password = req.body.password;

        const search = await User.findOne({ UserName: username });
        let retrevedpwd = search.Password;

        if (retrevedpwd === password) {
            req.session.username = username;
            req.session._id = search._id;
            req.session.bio = search.Bio;
            req.session.totallikes = search.TotalLikes;
            req.session.totalawards = search.TotalAwards;

            res.redirect("/home");
        } else {
            console.log("Invalid credentials!");
            res.render("login", { error: "Invalid credentials!", username: username });
        }
    } catch (error) {
        console.log(error)
        console.log("Not registered");
        res.render("login", { error: "Not regestered", username: "" });
    }
})

//delete user
const deleteUser = require("./routes/deleteUser");
app.use(deleteUser);

//update user
const updateuser = require("./routes/updateUser");
app.use(updateuser);

// POST SCHEMA

const Post = require('./routes/newpostSchema');
const upload = require('./routes/Uploader')

// create post

app.post("/createPost", upload.single('image'), async (req, res) => {
    // console.log('Uploaded file:', req.file);

    const clientIp = req.ip;
    const location = geoip.lookup(clientIp);

    let locationString = 'Unknown';

    if (location) {
        // If location is available, construct the location string
        locationString = `${location.city}, ${location.country}`;
    }

    const newPost = new Post({
        Uploader: req.session._id,
        UploaderName: req.session.username,
        Caption: req.body.caption,
        ImageUrl: req.file.path,
        FileName: req.file.filename, // filename property to store path
        IPAddress: clientIp,
        Location: locationString,
    });

    await newPost.save()
        .then(() => {
            console.log('Post saved successfully.');
            res.status(200);
            res.redirect("/home");
        }).catch((err) => {
            console.log('Error saving post:', err);
            res.status(500);
            res.render("errorPage", {code:"500", message: "INTERNAL SERVER ERROR"});
        });
})

// handle likes and awards
const handlePost = require("./routes/handleLikes");
app.use(handlePost);

// user profile
const userProfile = require("./routes/pofileRoute");
app.use(userProfile);

// search profile
const searched = require("./routes/search");
app.use(searched);

//delete post
const deletepost = require("./routes/deletePost")
app.use(deletepost);

app.listen(`${port}` || 3000, () => {
    console.log("Server has started successfully on port " + `${port}`);
});
