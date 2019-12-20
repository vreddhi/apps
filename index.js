const { exec } = require('child_process');
let EdgeGrid = require('edgegrid');
let untildify = require('untildify');
var Rubidium = require('rubidium');
const path = require('path');
const sqlite3 = require('sqlite3');
const sendmail = require('sendmail')();
var express = require('express'),
    http=require('http'),
    exphbs = require('express-handlebars'),
    app=express();

var rb = new Rubidium();
//set view engine

app.engine('.hbs', exphbs({

    defaultLayout:'default', //specifying the file name of our default template
    layoutsDir:"views/layouts/", //specifying the directory where layouts are saved
    extname:'.hbs' //defining file extension. if not specified, the default is 'handlebars'

}));

app.set('view engine', '.hbs');
app.use(express.urlencoded())
app.set('port', process.env.PORT || 3000);

//GET main page
app.get('/', function(req, res){
    console.log('Control is in main');
    res.render('main/index');
});

//GET search/cancel page
app.get('/cancel', function(req, res){
    res.render('main/cancel');
});

//To scheduler

var scheduleJob = function (req, res, next) {
  config_name_1 = req.body['config_name_1']
  config_version_1 = req.body['config_version_1']
  actvn_date_time = req.body['actvn_date_time']
  actvn_network = req.body['actvn_network']
  sdpr_link = req.body['sdpr_link']
  reviewer_email = req.body['reviewer_email']
  submitter_email = req.body['submitter_email']
  customer_email = req.body['customer_email']
  notification_email = req.body['notification_email']
  account_switch_key = req.body['account_switch_key']
  console.log(req.body);
  next()
}

app.use('/scheduler',scheduleJob)
require('./scheduler')(app);

//GET to confirm activation from Reviewer

var confirmJob = function (req, res, next) {
  config_name_1 = req.body['config_name_1']
  config_version_1 = req.body['config_version_1']
  actvn_date_time = req.body['actvn_date_time']
  actvn_network = req.body['actvn_network']
  sdpr_link = req.body['sdpr_link']
  reviewer_email = req.body['reviewer_email']
  submitter_email = req.body['submitter_email']
  customer_email = req.body['customer_email']
  notification_email = req.body['notification_email']
  account_switch_key = req.body['account_switch_key']
  console.log(req.body);
  next()
}
app.use('/confirm',confirmJob)

require('./confirm')(app);

//Search activations
var searchJob = function (req, res, next) {
  schedule_id = req.body.schedule_id ;
  config_name = req.body.config_name ;

  next()
}
app.use(searchJob)
require('./search')(app);



//Cancel schedule
var cancelSchedule = function (req, res, next) {
  schedule_id = req.query.schedule_id ;
  console.log("schedule id index.js = "+ schedule_id)

  next()
}
app.use(cancelSchedule)
require('./cancel')(app);


//Cancel schedule
var cancelScheduleIssueRedirect = function (req, res, next) {
  schedule_id = req.query.schedule_id ;
  console.log("schedule cancelScheduleIssueRedirect = "+ schedule_id)

  next()
}
app.use(cancelScheduleIssueRedirect)
require('./cancelschedule_issueredirect')(app);



//start server
http.createServer(app).listen(app.get('port'), function () {
   console.log('starting server on port '+app.get('port'));
 });
