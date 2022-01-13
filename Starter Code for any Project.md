```js
//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({
    extended:true
}));

app.use(express.static("public"));

app.get("/",function(req,res){
    res.send("Hello!");
});

app.listen(3000,function(){
    console.log("Server started on port 3000");
});

//connecting or creating of database to server
// mongoose.connect("mongodb+srv://admin-eshan:Test123@cluster0.l312f.mongodb.net/todoListDB", { useNewUrlParser: true });

//connecting or creating of database to local server
// mongoose.connect("mongodb://localhost:27017/todoListDB");

//defining the schema
var itemsSchema = {
    name: String
};

//creating a collection using the schema
var Item = mongoose.model("Item", itemsSchema);


//Now Item will be the model
```
