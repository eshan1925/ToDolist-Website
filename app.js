var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var items = ["Buy Food","Cook Food","Eat Food"];
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.get("/", function (req, res) {
    var today = new Date();
    var options = {
        weekday:"long",
        day:"numeric",
        month:"long"
    };

    var day = today.toLocaleDateString("en-US",options);
    // var currentDay = today.getDay();
    // var day = "";
    // var week = { "Monday": 1, "Tuesday": 2, "Wednesday": 3, "Thursday": 4, "Friday": 5, "Saturday": 6, "Sunday": 0 };
    // day = Object.keys(week).find(key => week[key] === currentDay);
    res.render("list", { kindOfDay: day, newListItems:items });
});

app.post("/",function(req,res){
    var item = req.body.newItem;
    items.push(item);
    res.redirect("/");
    console.log(item);
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
});