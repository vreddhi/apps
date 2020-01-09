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
var database = require('./database.js')

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
            .catch((result) => {
              //Use a different template for the failure response
              responseText = result['responseText']
              res.render('main/confirmresult', { responseText });
            });
});


//Route search
app.use('/search', (req, res) => {
  res.render('main/search.hbs')
})

//Route search and cancel
app.use('/searchandcancel',(req, res) => {
  config_name = req.body.config_name
  searchObj = new search()
  searchObj._findSchedule(req.body.config_name)
           .then((result) => {
              //Fetch the version, date, job_id, status from the result and use it
              var dataRows = result['queryResult']
              if(dataRows.length < 1) {
                //We got NOTHING to display
                var responseText = 'Activation details of ' + req.body.config_name + ' configuration is not found'
                res.render('main/searchFailure' , { responseText } );
              } else {
                //We got some results to display
                // Sending cancel_button_status to views to disable Cancel button for status anything other than PENDING_APPROVAL or SCHEDULED
                var arrayLength = dataRows.length;
                if (arrayLength != 0) {
                    for (var i = 0; i < arrayLength; i++) {
                    if (dataRows[i].status != "PENDING_APPROVAL" && dataRows[i].status != "SCHEDULED") {
                      dataRows[i].cancel_button_status = "disabled";
                    };
                  }
                }
                res.render('main/searchresult', { dataRows } );
              }
           })
           .catch((result) => {
             //This is a failure scenario. _findSchedule function resulted in Failure for some reason
             var responseText = 'Activation details of ' + req.body.config_name + ' Configuration is not found'
             res.render('main/searchFailure' , { responseText } );
           })
})


//Route cancel schedule
app.use('/cancel', (req, res) => {
  cancelObj = new cancel()
  cancelObj._cancelSchedule(req.query.job_id)
           .then((result) => {
            //Success scenario/response
            //console.log(result)
            //send success if cancel db update is success
            res.send("success")
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
