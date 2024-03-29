const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('cookie-session');
// const MongoDBStore = require('connect-mongodb-session')(session);
const geoip = require('geoip-lite');
require("dotenv").config();
const bcrypt = require('bcrypt');
const saltRounds = 12;
const fs = require("fs");

//------------- Copyright ------------------ Soumyadeep Sinha ---------------- Node Js----------------

const port = 3000;

const app = express();

app.use((req, res, next) => {
  fs.access("./public/DND.LICENSE.txt", fs.constants.F_OK, (err) => {
    if (err) {
      res.send('You are not authorized to use the software. Please provide a valid license.');
    } else {
      next();
    }
  });
});

// CONNECTION
const locale = "mongodb://localhost:27017/stealthDB";
const uri = process.env.CONNECTOR;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("successfully connected to your MongoDB database."))
    .catch((error) => {
        console.log(error)
        res.render("errorPage", { code: "503", message: "SERVICE UNAVAILABLE" });
    })


// const store = new MongoDBStore({
//     mongooseConnection: mongoose.connection,
//     collection: 'sessions'
// });

app.use(session({
    secret: '##123#123##',
    resave: false,
    saveUninitialized: true,
}));

// initializer
app.use(bodyParser.json({ limit: '25mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '25mb', extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

const authRoute = require("./routes/auth");
const homeroute = require("./routes/home");
const updateroute = require("./routes/UpdateUserroute");

app.use(authRoute);
app.use(homeroute);
app.use(updateroute);

// calling user schema
const User = require("./routes/userSchema")

// AUTHORIZATION
app.post("/register", async (req, res) => {

    const userName = req.body.username;
    const password = req.body.password;
    const confPassword = req.body.confpassword;

    const username = req.session.userName;

    if (password === confPassword) {
        try {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const maindata = new User({
                UserName: userName,
                Password: hashedPassword,
                Bio: "THIS IS A SAMPLE BIO YOU CAN UPDATE IT.",
                TotalLikes: 0,
                TotalAwards: 0
            });

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
        } catch (error) {
            console.log(error);
            res.render("errorPage", { code: "504", message: "GATEWAY TIMEOUT" });
        }
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

        const hashedPassword = search.Password;
        const isMatch = await bcrypt.compare(password, hashedPassword);

        if (isMatch) {
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
        res.render("login", { error: "Not registered", username: "" });
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
            res.render("errorPage", { code: "500", message: "INTERNAL SERVER ERROR" });
        });
})

// handle likes and awards
const handlePost = require("./routes/handleLikes");
app.use(handlePost);

// handle comments
const comments = require("./routes/sendComment");
app.use(comments);

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
