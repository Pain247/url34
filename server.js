var express = require('express');
var app= express();

var mongodb = require('mongodb');
var urldb = "mongodb://rd:123@ds031617.mlab.com:31617/url-shortener-microservice";
var mongo = mongodb.MongoClient;
var validUrl = require('valid-url');

app.get('/', function(req, res, next) {
  res.sendFile(__dirname+'/'+'index.html');
});

app.get('/new/:url(*)', function (req, res, next) {
  mongo.connect(urldb, function (err, db) {
    if (err) console.log("err"); 
      var collection = db.collection('links');
      var params = req.params.url;
      var local = req.get('host'); + "/";
      var newDoc = function (db, callback) {
        collection.findOne({ "url": params }, { short: 1, _id: 0 }, function (err, doc) {
          if (doc != null) {
            res.json({ original_url: params, short_url:doc.short });
          } else {
            if (validUrl.isUri(params)) {
              var shortCode =  Math.floor((Math.random() * 1000) + 1).toString();
              var newUrl = { url: params, short: shortCode };
              collection.insert([newUrl]);
              res.json({ original_url: params, short_url: shortCode });
            } else{
              res.json({ error: "error"});
            };
          };
        });
      };

      newDoc(db, function () {
        db.close();
      });

    };
  });

});

app.get('/:short', function (req, res, next) {

 mongo.connect(urldb, function (err, db) {
    if (err) console.log("err");
    var collection = db.collection('links');
      var params = req.params.short;
      var findUrl = function (db, callback) {
        collection.findOne({ "short": params }, { url: 1, _id: 0 }, function (err, doc) {
          if (doc != null) {
            res.redirect(doc.url);
          } else {
            res.json({ error: "Wrong shortlink" });
          };
        });
      };

      findUrl(db, function () {
        db.close();
      });

    };
  });
});
app.listen(process.env.PORT||8000);
