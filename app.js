//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
//const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const itemsSchema = {
  name: String
};

const listSchema = {
  name : String,
  items : [itemsSchema]
};

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "Welcome to ToDO List"
});

const item2 = new Item({
  name: "List your work"
});

const item3 = new Item({
  name: "checked to delete"
});

const defaultItems = [item1, item2, item3];

//const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("insertion Successful");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });

  //const day = date.getDate();
  //res.render("list", {listTitle: day, newListItems: items});

});

app.post("/", function(req, res) {

  const newItemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name : newItemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }


  /*if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  } */
});

app.post("/delete", function(req, res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemID, function(err){
      if(!err){
        console.log("item deleted Successful");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}},
    function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        //show an existing list
        res.render("list", {listTitle:foundList.name, newListItems: foundList.items});
      }
    }
  });
});

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
