//required packages
var express = require('express');
var bodyParser = require('body-parser');
var date = require(__dirname+"/date.js");

//app building
var app = express();

//list of To-do's
var items = ["Buy Food","Cook Food","Eat Food"];
let workItems = [];

//Loading Ejs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//Get functions
app.get("/", function (req, res) {
    let day = date.getDate();
    res.render("list", { listTitle: day, newListItems:items,buttonName:"Work List🏢",redirectLocation:"http://localhost:3000/work"});
});

app.get("/work",function (req,res) { 
    res.render("list",{listTitle:"Work List",newListItems:workItems,buttonName:"ToDo List✅",redirectLocation:"http://localhost:3000/"});
});

app.get("/about",function(req,res){
    res.render("about",{listTitle:"About Us",redirectLocation:"http://localhost:3000/"});
});

//Post Functions
app.post("/",function(req,res){
    var item = req.body.newItem;
    if(req.body.list==="Work"){
        workItems.push(item);
        res.redirect("/work");
    }else{
        items.push(item);
        res.redirect("/");
    }
    console.log(item);
});

app.post("/work",function(req,res){
    var item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
    console.log(item);
});

//Listen Functions
app.listen(3000, function () {
    console.log("Server started on port 3000");
});