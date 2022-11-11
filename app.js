//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistdb",{useNewUrlParser: true});
const itemsSchema = { name: String };
const Item = mongoose.model("Item" , itemsSchema);
const item1 = new Item({
  name:"Good"
});
const item2 = new Item({
  name:"Better"
});
const item3 = new Item({
  name:"Best"
});
const defaultItems = [item1,item2,item3];
const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List",listSchema);
app.get("/", function(req, res) {
    Item.find({},function(err,foundItems){
      if(foundItems.length === 0){
        Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err)
        }else{
        console.log("Sucessfull saved items in the database")
       }
    });
    res.redirect("/");
      }else{
        res.render("list", {listTitle:"Today", newListItems:foundItems});
      }
    });
});
app.get("/:costomListName", function(req,res){
  const costomListName = _.capitalize(req.params.costomListName);

  List.findOne({name:costomListName}, function(err,foundList){
    if(!err){
      if(!foundList){
         const list = new List({
         name:costomListName,
         items: defaultItems
        });
        list.save();
        res.redirect("/"+ costomListName);
      }else{
        res.render("list", {listTitle:foundList.name, newListItems:foundList.items});
      }
    }
  });
});
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName === "Today"){
    item.save();
     res.redirect("/");
  }else{
    List.findOne({name:listName}, function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});
app.post("/delete",function(req,res){
  const chechedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
  Item.findByIdAndRemove(chechedItemId,function(err){
    if(!err){
      console.log("successfully deleted chexked item.");
      res.redirect("/");
    }
  });
    }else{
      List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:chechedItemId}}}, function(err,foundList){
        if(!err){
          res.redirect("/"+listName);
        }
      });
    }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
