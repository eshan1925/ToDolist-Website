//required packages
var express = require('express');
var bodyParser = require('body-parser');
var date = require(__dirname + "/date.js");
var mongoose = require("mongoose");
var _ = require("lodash");
//app building
var app = express();


//Loading Ejs
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//connecting or creating of database
mongoose.connect("mongodb+srv://admin-eshan:Test123@cluster0.l312f.mongodb.net/todoListDB", { useNewUrlParser: true });

//defining the schema
var itemsSchema = {
    name: String
};

//creating a collection using the schema
var Item = mongoose.model("Item", itemsSchema);

//using the schema and building some default objects
var item1 = new Item({
    name: "Welcome to your todo List!"
});

var item2 = new Item({
    name: "Hit the + button to add a new task!"
});

var item3 = new Item({
    name: "<---Hit this to delete an item."
});

var defaultItems = [item1, item2, item3];

var listSchema = {
    name: String,
    items: [itemsSchema]
};

var List = mongoose.model("List", listSchema);
// inserting items
// Item.insertMany(defaultItems, function (err) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("Successfully added items!!!");
//     }
// });

var day = date.getDate();
//Get functions
app.get("/", function (req, res) {
    //finding items
    Item.find({}, function (err, foundItems) {
        if (err) {
            console.log(err);
        } else {
            if (foundItems.length === 0) {
                Item.insertMany(defaultItems, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Successfully added items!!!");
                    }
                });
                res.redirect("/"); //for redirecting so that we can see the items
            } else {
                console.log("Successfully found Items!!!");
                res.render("list", { listTitle: "Today", newListItems: foundItems, buttonName: "Work List🏢", redirectLocation: "/work" });
            }
        }
    });
});

app.get("/:customListName", function (req, res) {
    var customListName =_.capitalize(req.params.customListName);
    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                //Create a new List
                var list = new List({
                    name: customListName,
                    items: defaultItems
                });

                list.save();
                res.redirect("/" + customListName);
            } else {
                //Show an exisiting List
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items, buttonName: "ToDo List✅", redirectLocation: "/" });
            }
        }
    });

});

// app.get("/work", function (req, res) {
//     res.render("list", { listTitle: "Work List", newListItems: workItems, buttonName: "ToDo List✅", redirectLocation: "http://localhost:3000/" });
// });

// app.get("/about", function (req, res) {
//     res.render("about", { listTitle: "About Us", redirectLocation: "http://localhost:3000/" });
// });

//Post Functions
app.post("/", function (req, res) {
    var itemName = req.body.newItem;
    var listName = req.body.list;
    var item = new Item({
        name: itemName
    });
    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            if (err) {
                console.log(err);
            } else {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            }
        });
    }
});

app.post("/delete", function (req, res) {
    var checkedItemId = req.body.checkbox;
    var listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (!err) {
                console.log("Removed Item from Default List");
                res.redirect("/");
            }
        });
    } else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
            if(!err){
                console.log("Removed Item from "+listName+" List");
                res.redirect("/"+listName);
            }
        });
    }
});

let port = process.env.PORT;
if(port==null || port==""){
    port=3000;
}

//Listen Functions
app.listen(port, function () {
    console.log("Server has started successfully!");
});