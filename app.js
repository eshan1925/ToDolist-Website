var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.set('view engine','ejs');

app.get("/", function (req, res) {
    var today = new Date();
    var currentDay = today.getDay();
    var day="";
    var week = {"Monday":1,"Tuesday":2,"Wednesday":3,"Thursday":4,"Friday":5,"Saturday":6,"Sunday":0};
    day=Object.keys(week).find(key=>week[key]===currentDay);
    res.render("list",{kindOfDay:day});
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
});