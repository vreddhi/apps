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


var hbs = exphbs.create({
    helpers: {
        buttonClass: function (status) {
            return '';
        }
    },
    defaultLayout: 'default',
    layoutsDir:"views/layouts/",
    extname:'.hbs'
});

app.engine('.hbs', hbs.engine);

//set view engine
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
                //Sort the dataRows in the order of PENDING_APPROVAL, SCHEDULED and others
                var dataRowsSorted = [];
                var dataRowsLength = dataRows.length;
\                if (dataRowsLength != 0) {
                    for (var i = 0; i < dataRowsLength; i++) {
                    if (dataRows[i].status == "PENDING_APPROVAL") {
                      dataRowsSorted.push(dataRows[i]);
                      };
                    }
                    for (var i = 0; i < dataRowsLength; i++) {
                    if (dataRows[i].status == "SCHEDULED") {
                      dataRowsSorted.push(dataRows[i]);
                      };
                    }
                    for (var i = 0; i < dataRowsLength; i++) {
                    if (dataRows[i].status != "PENDING_APPROVAL"  && dataRows[i].status != "SCHEDULED") {
                      dataRowsSorted.push(dataRows[i]);
                      };
                    }
                }
                res.render('main/searchresult', {dataRowsSorted,
                                                // Override `foo` helper only for this rendering.
                                                helpers: {
                                                            buttonClass: function (status, value='') {
                                                              if(status == 'CANCELLED'){
                                                                if(value == 'value') {
                                                                  return 'CANCELLED'
                                                                }
                                                                return 'disabled';
                                                              }
                                                              if(status === 'SCHEDULED' | status === 'PENDING_APPROVAL'){
                                                                if(value == 'value') {
                                                                  return 'CANCEL'
                                                                }
                                                              } else {
                                                                if(value == 'value') {
                                                                  return 'CANCEL'
                                                                }
                                                                return 'disabled';
                                                              }
                                                            }
                                                          }
                                                });
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
            console.log(result['updatedRows'])
            res.json({ 'updatedRows': result['updatedRows']})

           })
           .catch((result) => {
            //Failure scenario/response
            res.json({ 'updatedRows': null})
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
