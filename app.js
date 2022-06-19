//jshint esversion:6

//required packages
require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var date = require(__dirname + "/date.js");
var mongoose = require("mongoose");
var _ = require("lodash");
var { check, validationResult } = require('express-validator');
var alert = require("alert");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const { bindAll, intersection } = require('lodash');
const moment = require('moment');
//app building
var app = express();



//Loading Ejs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 36000000 //10 Hour
    }
}));

//initialising passport
app.use(passport.initialize());

//passport will also use session
app.use(passport.session());


var connectionURL = "mongodb+srv://admin-eshan:" + process.env.MONGO + "@cluster0.l312f.mongodb.net/todoListDB";
//connecting or creating of database to server
mongoose.connect(connectionURL, { useNewUrlParser: true });

//connecting or creating of database to local server
// mongoose.connect("mongodb://localhost:27017/todoListDB");

//defining the schema
var itemsSchema = {
    id: String,
    name: String,
    checked: Boolean,
    dateOfCompletion: String,
    tags: [{ type: String }],
};

//defining the schema like an object becuase we want to use encryption
var userSchema = new mongoose.Schema({
    email: String,
    userName: String,
    password: String,
    name: String,
    secret: String
});

//giving a plugin to our pre built schema as level 5
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

//creating a collection using the schema
var Item = mongoose.model("Item", itemsSchema);
//creating a collection using the schema
var User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

//this works to serialise user in all cases
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://lit-thicket-87663.herokuapp.com/auth/google/lists",
},
    function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));


var listSchema = {
    name: String,
    items: [itemsSchema],
    id: String
};

var List = mongoose.model("List", listSchema);

var day = date.getDate();
//Get functions
app.get("/", function (req, res) {
    res.render("home.ejs", { redirectLocation: "/login-signup" });
});

app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile"] })
);

app.get("/auth/google/lists",
    passport.authenticate("google", { failureRedirect: "/register" }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect("/list/" + req.user._id);
    });

app.get("/list/:userId", function (req, res) {
    if (req.isAuthenticated()) {
        const presentUserId = req.params.userId;
        // finding items
        Item.find({ id: presentUserId }, function (err, foundItems) {
            if (err) {
                console.log(err);
            } else {
                if (foundItems.length === 0) {
                    var today = new Date();
                    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                    //using the schema and building some default objects
                    var item1 = new Item({
                        name: "Welcome to your todo List!",
                        id: presentUserId,
                        checked: false,
                        dateOfCompletion: moment.utc(date).format('MM/DD/YYYY').toString(),
                        tags: ["Default"],
                    });

                    var item2 = new Item({
                        name: "Hit the + button to add a new task!",
                        id: presentUserId,
                        checked: false,
                        dateOfCompletion: moment.utc(date).format('MM/DD/YYYY').toString(),
                        tags: ["Default"],
                    });

                    var item3 = new Item({
                        name: "<---Hit this to delete an item.",
                        id: presentUserId,
                        checked: false,
                        dateOfCompletion: moment.utc(date).format('MM/DD/YYYY').toString(),
                        tags: ["Default"],
                    });

                    var defaultItems = [item1, item2, item3];
                    Item.insertMany(defaultItems, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Successfully added items!!!");
                        }
                    });
                    res.redirect("/list/" + presentUserId); //for redirecting so that we can see the items
                } else {
                    console.log("Successfully found Items!!!");
                    User.find({ _id: presentUserId }, function (err, currentUser) {
                        if (!err) {
                            console.log(currentUser[0]);
                            res.render("list", { listTitle: "Today", newListItems: foundItems, buttonName: "Work List🏢", secondButtonName: "Archieves ✅", redirectLocation: "/work/" + presentUserId, secondRedirectLocation: "/archieves/" + presentUserId, presentUser: presentUserId, userName: currentUser[0].username });
                        }
                    })
                }
            }
        });
    } else {
        res.redirect("/");
    }
});

app.get("/archieves/:userId", function (req, res) {
    if (req.isAuthenticated()) {
        const presentUserId = req.params.userId;
        // finding items
        Item.find({ id: presentUserId }, function (err, foundItems) {
            if (err) {
                console.log(err);
            } else {
                if (foundItems.length === 0) {
                    var today = new Date();
                    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
                    //using the schema and building some default objects
                    var item1 = new Item({
                        name: "Welcome to your todo List!",
                        id: presentUserId,
                        checked: false,
                        dateOfCompletion: moment.utc(date).format('MM/DD/YYYY').toString(),
                        tags: ["Default"],
                    });

                    var item2 = new Item({
                        name: "Hit the + button to add a new task!",
                        id: presentUserId,
                        checked: false,
                        dateOfCompletion: moment.utc(date).format('MM/DD/YYYY').toString(),
                        tags: ["Default"],
                    });

                    var item3 = new Item({
                        name: "<---Hit this to delete an item.",
                        id: presentUserId,
                        checked: false,
                        dateOfCompletion: moment.utc(date).format('MM/DD/YYYY').toString(),
                        tags: ["Default"],
                    });

                    var defaultItems = [item1, item2, item3];
                    Item.insertMany(defaultItems, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Successfully added items!!!");
                        }
                    });
                    res.redirect("/list/" + presentUserId); //for redirecting so that we can see the items
                } else {
                    console.log("Successfully found Items!!!");
                    User.find({ _id: presentUserId }, function (err, currentUser) {
                        if (!err) {
                            res.render("list", { listTitle: "Archieves", newListItems: foundItems, buttonName: "Work List🏢", secondButtonName: "ToDos🧐", redirectLocation: "/work/" + presentUserId, secondRedirectLocation: "/list/" + presentUserId, presentUser: presentUserId, userName: currentUser[0].username });
                        }
                    })
                }
            }
        });
    } else {
        res.redirect("/");
    }
});



app.get("/work/:userId", function (req, res) {
    if (req.isAuthenticated()) {
        const presentUserId = req.params.userId;
        var listName = _.capitalize("work");
        var today = new Date();
        var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        List.findOne({ name: listName, id: presentUserId }, function (err, foundList) {
            if (!err) {
                if (!foundList) {
                    var item1 = new Item({
                        name: "Welcome to your todo List!",
                        id: presentUserId,
                        checked: false,
                        dateOfCompletion: moment.utc(date).format('MM/DD/YYYY').toString(),
                        tags: ["Default"],
                    });

                    var item2 = new Item({
                        name: "Hit the + button to add a new task!",
                        id: presentUserId,
                        checked: false,
                        dateOfCompletion: moment.utc(date).format('MM/DD/YYYY').toString(),
                        tags: ["Default"],
                    });

                    var item3 = new Item({
                        name: "<---Hit this to delete an item.",
                        id: presentUserId,
                        checked: false,
                        dateOfCompletion: moment.utc(date).format('MM/DD/YYYY').toString(),
                        tags: ["Default"],
                    });
                    var defaultItems = [item1, item2, item3];
                    //Create a new List
                    var list = new List({
                        name: listName,
                        items: defaultItems,
                        id: presentUserId
                    });

                    list.save();
                    res.redirect("/work/" + presentUserId);
                } else {
                    //Show an exisiting List
                    User.find({ _id: presentUserId }, function (err, currentUser) {
                        if (!err) {
                            console.log(foundList);
                            res.render("list", { listTitle: foundList.name, newListItems: foundList.items, buttonName: "ToDo List✅",secondButtonName: "ToDos🧐", redirectLocation: "/list/" + presentUserId, presentUser: presentUserId.replace, userName: currentUser[0].username,secondRedirectLocation: "/list/" + presentUserId });
                        }
                    })
                }
            }
        });
    } else {
        res.redirect("/");
    }
});

app.get("/about/:userId", function (req, res) {
    const presentUserId = req.params.userId;
    res.render("about", { listTitle: "About Us", redirectLocation: "/list/" + presentUserId });
});

app.get("/login-signup", function (req, res) {
    res.render("login-signup");
});

app.get("/logout", function (req, res) {
    //logout is also a function from passport.js and it logsout the user accordingly.
    req.logOut();
    res.redirect("/");
});

//Post Functions
app.post("/list/:userId", [check('newItem').isLength({ min: 1, max: 50 })], function (req, res) {
    var presentUserId = req.params.userId;
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("Field is too short!!!");
        alert("Field is too short!!!");
        res.redirect("/list/" + presentUserId);
    } else {
        var itemName = req.body.newItem;
        var listName = req.body.list;
        var completionDate = req.body.completionDate;
        completionDate = moment.utc(completionDate).format('MM/DD/YYYY').toString();
        var tagsOftask = req.body.tags;
        tagsOftask = tagsOftask.split(',');
        var item = new Item({
            id: presentUserId,
            name: itemName,
            checked: false,
            dateOfCompletion: completionDate,
            tags: tagsOftask,
        });
        if (listName === "Today") {
            item.save();
            res.redirect("/list/" + presentUserId);
        } else {
            List.findOne({ name: listName, id: presentUserId }, function (err, foundList) {
                if (err) {
                    console.log(err);
                } else {
                    foundList.items.push(item);
                    foundList.save();
                    res.redirect("/" + listName.toLowerCase() + "/" + presentUserId);
                }
            });
        }
    }
});

app.post("/delete/:userId", function (req, res) {
    var presentUserId = req.params.userId;
    var checkedItemId = req.body.ItemDelete;
    var listName = req.body.listName;
    if (listName === "Today" || listName === "Archieves") {
        Item.findById({ "_id": checkedItemId }, function (err, params) {
            if (!err) {
                Item.findByIdAndUpdate(checkedItemId, { checked: !params.checked }, function (err, params) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Updation Successfull!");
                    }
                    res.redirect("/list/" + presentUserId);
                })
            } else {
                console.log(err);
            }
        });
    
    // if (listName === "Today") {
    //     Item.findByIdAndRemove(checkedItemId, function (err) {
    //         if (!err) {
    //             console.log("Removed Item from Default List");
    //             res.redirect("/list/" + presentUserId);
    //         }
    //     });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
            if (!err) {
                console.log("Removed Item from " + listName + " List");
                res.redirect("/" + listName + "/" + presentUserId);
            }
        });
    }
});

app.post("/register", function (req, res) {
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/login-signup");
            });
        }
    });
});

app.post("/login", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    // logIn function is given to us from passport and it performs everything bts to login and authenticate our user.
    req.logIn(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/list/" + req.user._id);
            });
        }
    });
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

//Listen Functions
app.listen(port, function () {
    console.log("Server has started successfully!");
});
