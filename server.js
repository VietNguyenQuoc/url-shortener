'use strict';

var express = require('express');
var mongoose = require('mongoose');
const dns = require('dns');
const Ruler = require('url');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
mongoose.connect("mongodb+srv://quocviet:quocviet@vidly-2mbqg.mongodb.net/url-shortener?retryWrites=true&w=majority", { useUnifiedTopology: true, useNewUrlParser: true });
const Url = mongoose.model('url', new mongoose.Schema({
  "original_url": String,
  "short_url": Number
}));

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.urlencoded());

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl/new", async (req, res) => {
  const url_string = Ruler.parse(req.body.url);

  if (!url_string.protocol || !url_string.hostname) return res.json({ error: "invalid URL" });

  dns.lookup(url_string.hostname, async (error) => {
    if (error) {
      return res.json({ error: "invalid URL" });
    }
    
    console.log('hello');
    let url = await Url.findOne({ "original_url": req.body.url });

    if (url) {
      return res.json({
        original_url: url.original_url,
        short_url: url.short_url
      });
    }

    url = new Url({
      original_url: req.body.url,
      short_url: Math.floor(Math.random() * 999)
    });

    url.save();

    return res.json({
      original_url: url.original_url,
      short_url: url.short_url
    })
  });
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});