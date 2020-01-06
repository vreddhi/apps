let EdgeGrid = require('edgegrid');
let untildify = require('untildify');
var express = require('express'),
    http=require('http'),
    exphbs = require('express-handlebars'),
    app=express();
var scheduler = require('./scheduler.js')
var confirm = require('./confirm.js')
var mail = require('./mail.js')
var search = require('./search.js')
var cancel = require('./cancel.js')
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
    res.render('main/index');
});

//GET search/cancel page
app.get('/cancel', function(req, res){
    res.render('main/cancel');
});

//Route scheduler
app.use('/scheduler',(req, res) => {
  var schedulerObj = new scheduler(req);
  schedulerObj.schedule()
              .then((result) => {
                //Succeeded with all validations. Send email to reviewer
                //Get the job_id from secheduler response and construct HTML
                console.log(result)
                sendEmails = new mail()._triggerEmails(schedulerObj, job_id=result['job_id'])
                                       .catch((emailResult) => {
                                         result['responseText'] = result['responseText'] +
                                                                  '.\nUnable to send emails'
                                       })
                response = result['responseText']
                res.render('main/schedulerresult', { response });
              })
              .catch((result) => {
                console.log(result)
                response = result['responseText']
                res.render('main/schedulerresult', { response });
              })
});

//Route Confirmation
app.use('/confirm', (req,res) => {
  var confirmObj = new confirm();
  confirmObj._setConfirmation(req)
            .then((result) => {
              responseText = result['responseText']
              res.render('main/confirmresult', { responseText });
            })
            .catch((result) => {}
              //Use a different template for the failure response
              responseText = result['responseText']
              res.render('main/confirmresult', { responseText });
            });
});


//Route search
app.use('./search',(req, res) => {
  config_name = req.body.config_name
  searchObj = new search()
  searchObj._findSchedule(req.body.config_name)
           .then((result) => {
              //Fetch the version, date, job_id, status from the result and use it
              res.render('main/searchresult', { config_name,
                                                config_version,
                                                actvn_date_time,
                                                schedule_id,
                                                schedule_status});
           })
           .catch((result) => {
             //This is a failure scenario. Send a dummy onbject back
             res.render('main/searchresult_nodata' , { config_name,
                                                       config_version_1,
                                                       actvn_date_time,
                                                       schedule_id,
                                                       schedule_status});
           })
})



//Route cancel schedule
app.use('/cancel', (req, res) => {
  cancelObj = new cancel()
  cancelObj._cancelSchedule(req.query.schedule_id)
           .then((result) => {
            //Success scenario/response
           })
           .catch((result) => {
            //Failure scenario/response
           })
})



//Cancel schedule
/*
var cancelScheduleIssueRedirect = function (req, res, next) {
  schedule_id = req.query.schedule_id ;
  console.log("schedule cancelScheduleIssueRedirect = "+ schedule_id)

  next()
}
app.use(cancelScheduleIssueRedirect)
require('./cancelschedule_issueredirect')(app);
*/


//start server
http.createServer(app).listen(app.get('port'), function () {
   console.log('starting server on port '+app.get('port'));
 });
