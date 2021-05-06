//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const homeStartingContent = "Welcome to my weight losing website for 2021! Go to about to learn why I made this site. Or go to compose to add an entry!";
const aboutContent = "My name is Vedant. I am currently a sophomore majoring in CS. For the year 2021, my two goals are to learn web developement and get in better shape. This website was my attempt to combine them."

const app = express();

mongoose.connect("mongodb://localhost:27017/weightDB", { useNewUrlParser: true });

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const postSchema = {
  month: {
    type: Number,
    min: 1,
    max: 12
  },
  day: {
    type: Number,
    min: 1,
    max: 31
  },
  weight: Number,
  food: String
};

const Post = mongoose.model("Post", postSchema);

app.get("/", function (req, res) {
  Post.find(function (err, posts) {
    res.render('home', { homescript: homeStartingContent, posts: posts });
  })
})

app.get("/about", function (req, res) {
  Post.find(function (err, posts) {
    var data = [];
    posts.forEach(function (post) {
      var dayOfYear = Math.floor(
        (new Date(2021, post.month - 1, post.day) - new Date(2021, 0, 0))
        / 1000 / 60 / 60 / 24);
      var weight = post.weight;
      var point = { x: dayOfYear, y: weight };
      data.push(point);
    });
    console.log(data)
    res.render('about', { aboutscript: aboutContent, collect: data });
  })
})

app.get("/compose", function (req, res) {
  res.render('compose');
})

app.post("/compose", function (req, res) {
  const post = new Post({
    month: req.body.month,
    day: req.body.day,
    weight: req.body.weight,
    food: req.body.food
  });
  post.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
})

app.get("/posts/:postID", function (req, res) {
  var inputID = req.params.postID;
  Post.findOne({ _id: inputID }, function (err, post) {
    res.render("post", { post: post })
  })
})

app.post("/posts/:postID", function (req, res) {
  var inputID = req.params.postID;
  console.log(inputID);
  Post.deleteOne({ _id: inputID }, function (err) {
    Post.find(function (err, posts) {
      res.render('home', { homescript: homeStartingContent, posts: posts });
    })
  });
})


app.listen(3000, function () {
  console.log("Server started on port 3000");
});
