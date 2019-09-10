var express = require('express');
var router = express.Router();
var schedule = require('node-schedule');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "Vreddhi's test site" });
});

router.post('/users/:userId/books/:bookId', function (req, res) {
  res.send(req.params)
});

var date = new Date(2019, 8, 4, 12, 58, 0);
var j = schedule.scheduleJob(date, function(){
  console.log('The world is going to end today.');
});


module.exports = router;
