let EdgeGrid = require('edgegrid');
let untildify = require('untildify');
var cookieParser = require('cookie-parser')
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
var user = require('./user.js')

var hbs = exphbs.create({
    helpers: {
        buttonState: function (status) {
            return '';
        },
        buttonValue: function (status) {
           return '';
        },
        buttonClass: function (status) {
            return '';
        },
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
app.use(cookieParser())


//Static files
app.use('/static', express.static('static'))

//Render login/signup page of session is not present
app.all('/*', (req, res, next) => {
  if(!req.cookies.session && (req.path != '/register' && req.path != '/login')){
    res.render('main/register')
  } else {
    next()
  }
})

//Default page for logged-on v/s logged-out users
app.all('/', (req, res, next) => {
  if(!req.cookies.session && (req.path != '/register' && req.path != '/login')){
    //This may be a duplicate code, handled above. need to check
    res.render('main/register')
  } else {
    res.render('main/homepage')
  }
})

//Signup Page
app.post('/register', (req,res) => {
  userObj = new user()
  userObj._createTable()
  userObj._createUser(req.body.email, req.body.passowrd)
         .then((data) => {
           console.log(data)
           reason = data['responseText']
           res.render('main/registerAgain', { reason })
           //Send emails to ADMIN
           sendEmailsObj = new mail()
           sendEmailsObj._getUserApprovalContent(req.body.email, 'http://localhost:3000/usermanagement')
                        .then((content) => {
                          sendEmailsObj._sendEmail('apps@akamai.com', 'vbhat@akamai.com', 'New User', content)
                        })
                        .catch((emailResult) => {
                          console.log('Unable to send email to approver.')
                        })
         })
         .catch((data) => {
           console.log(data)
           reason = data['responseText']
           res.render('main/registerAgain', { reason })
         })
})

//Login handler
app.post('/login',(req,res) => {
  userObj = new user()
  userObj._createTable()
  userObj._getUser(req.body.email, req.body.passowrd,'ACTIVE')
         .then((data) => {
           console.log('User resolved')
           console.log(data)
           var some_random_number = Math.floor(Math.random() * 10000).toString();

           if(req.body.remember_me == 'on') {
             //Set a longer cookie as user wants to be logged in
             res.cookie('session', some_random_number, { expires: new Date(Date.now() + 900000000)})
                .cookie('userid', req.body.email, { expires: new Date(Date.now() + 900000000)})
                .render('main/homepage')
           } else {
             res.cookie('session', some_random_number)
                .cookie('userid', req.body.email)
                .render('main/homepage')
           }
         })
         .catch((data) => {
           console.log('User NOT resolved')
           console.log(data)
           reason = data['responseText']
           res.render('main/registerAgain', { reason })
         })
})

//Log-out user by clearing cookie
app.all('/logout', (req, res) => {
    res.clearCookie('session')
       .clearCookie('userid')
       .render('main/register')
})


//Route user management
app.use('/usermanagement', (req,res) => {

  if(['vreddhi.bhat@gmail.com','vbhat@akamai.com','hmallika@akamai.com'].indexOf(req.cookies.userid) > -1) {
    //Valid admin user, so display all users to approve/deny
    config_name = req.body.config_name
    userObj = new user()
    userObj._getAllUsers()
             .then((result) => {
                //Fetch the version, date, job_id, status from the result and use it
                var dataRows = result['data']
                  //We got some results to display
                  res.render('main/usermanagement', {dataRows,
                                                  // Override `foo` helper only for this rendering.
                                                  helpers: {
                                                              buttonState: function (status) {
                                                                  return ''
                                                              },
                                                              buttonValue: function(status) {
                                                                //For below status allow cancel
                                                                if(['INACTIVE'].indexOf(status) > -1) {
                                                                  return 'Activate'
                                                                } else {
                                                                  return 'De-Activate'
                                                                }
                                                              },
                                                              buttonClass: function(status) {
                                                                //return bootstrap button class
                                                                var btn_class = 'btn btn-info btn-lg'
                                                                if(['INACTIVE'].indexOf(status) > -1) {
                                                                  btn_class = 'btn btn-success btn-lg'
                                                                } else if(['ACTIVE'].indexOf(status) > -1) {
                                                                  btn_class = 'btn btn-danger btn-lg'
                                                                }
                                                                return btn_class
                                                              }
                                                            }
                                                  });

             })
             .catch((result) => {
               //This is a failure scenario. _findSchedule function resulted in Failure for some reason
               var responseText = 'Activation details of ' + req.body.config_name + ' Configuration is not found'
               res.render('main/searchFailure' , { responseText } );
             })
  } else {
    res.status(403)
       .send('You do not have permission')
  }
})

//Route user approval
app.use('/manageuser', (req,res) => {
  userObj = new user()
  userObj._manageUser(req.query.id, req.query.operation)
            .then((result) => {
                console.log('User status is now updated.')
                res.json({ 'status': 1})
              })
            .catch((result) => {
              //Use a different template for the failure response
              console.log('User status cannot be updated.')
              responseText = result['responseText']
              res.json({ 'status': -1})
            });
});


//Route main page for logged-in users
app.get('/homepage', function(req, res){
    res.render('main/homepage');
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
              console.log('Confirmed')
              searchObj = new search()
              searchObj._findScheduleByJobId(req.query.job_id)
              .then((result) => {
                var dataRows = result['queryResult']
                var schedulerObj = {reviewer_email:dataRows[0].reviewer,
                                    submitter_email:dataRows[0].submitter,
                                    config_name:dataRows[0].config_name,
                                    config_version:dataRows[0].version,
                                    actvn_date_time:dataRows[0].date,
                                    actvn_network:dataRows[0].network,
                                    sdpr_link:dataRows[0].sdpr,
                                    customer_email:dataRows[0].customer,
                                    notification_email:dataRows[0].notification,
                                    account_switch_key:dataRows[0].switchkey,
                                    email_context:"confirm_notification"
                                    };
                console.log(schedulerObj)
                sendEmails = new mail()._triggerEmails(schedulerObj, job_id=req.query.job_id)
                                       .catch((emailResult) => {
                                         result['responseText'] = result['responseText'] +
                                                                  '.\nUnable to send emails'
                                       })
              })
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
                res.render('main/searchresult', {dataRows,
                                                // Override `foo` helper only for this rendering.
                                                helpers: {
                                                            buttonState: function (status) {
                                                              //If one of below values, disable the button by returning bootstrap class
                                                              if(['CANCELLED','FAILED','COMPLETED', 'IN_PROGRESS'].indexOf(status) > -1) {
                                                                return 'disabled'
                                                              } else {
                                                                return ''
                                                              }
                                                            },
                                                            buttonValue: function(status) {
                                                              //For below status allow cancel
                                                              if(['PENDING_APPROVAL','SCHEDULED'].indexOf(status) > -1) {
                                                                return 'Cancel'
                                                              } else {
                                                                return status
                                                              }
                                                            },
                                                            buttonClass: function(status) {
                                                              //return bootstrap button class
                                                              var btn_class = 'btn btn-info btn-lg'
                                                              if(['COMPLETED'].indexOf(status) > -1) {
                                                                btn_class = 'btn btn-success btn-lg'
                                                              } else if(['FAILED'].indexOf(status) > -1) {
                                                                btn_class = 'btn btn-dark btn-lg'
                                                              } else if(['CANCELLED'].indexOf(status) > -1) {
                                                                btn_class = 'btn btn-danger btn-lg'
                                                              }
                                                              return btn_class
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
            searchObj = new search()
            searchObj._findScheduleByJobId(req.query.job_id)
            .then((result) => {
              var dataRows = result['queryResult']
              var schedulerObj = {reviewer_email:dataRows[0].reviewer,
                                  submitter_email:dataRows[0].submitter,
                                  config_name:dataRows[0].config_name,
                                  config_version:dataRows[0].version,
                                  actvn_date_time:dataRows[0].date,
                                  actvn_network:dataRows[0].network,
                                  sdpr_link:dataRows[0].sdpr,
                                  customer_email:dataRows[0].customer,
                                  notification_email:dataRows[0].notification,
                                  account_switch_key:dataRows[0].switchkey,
                                  email_context:"cancel_notification"
                                  };
              console.log(schedulerObj)
              sendEmails = new mail()._triggerEmails(schedulerObj, job_id=req.query.job_id)
                                     .catch((emailResult) => {
                                       result['responseText'] = result['responseText'] +
                                                                '.\nUnable to send emails'
                                     })
            })
            res.json({ 'updatedRows': result['updatedRows']})

           })
           .catch((result) => {
            //Failure scenario/response
            res.json({ 'updatedRows': -1})
           })
})



//start server
http.createServer(app).listen(app.get('port'), function () {
   console.log('starting server on port '+app.get('port'));
 });
