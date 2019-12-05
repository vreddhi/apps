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

require('./confirm')(app);

//Search activations
var searchJob = function (req, res, next) {
  schedule_id = req.body.schedule_id ;
  next()
}
app.use(searchJob)
require('./search')(app);


//Cancel schedule
var cancelSchedule = function (req, res, next) {
  schedule_id = req.body.schedule_id ;

  next()
}
app.use(cancelSchedule)
require('./cancel')(app);

//start server
http.createServer(app).listen(app.get('port'), function () {
   console.log('starting server on port '+app.get('port'));
});

//Function to setup EdgeAuth for API requests.
function setup(auth = { path: "~/.edgerc", section: "papi", debug: false, default: true}) {

    if (auth.clientToken && auth.clientSecret && auth.accessToken && auth.host)
        _edge = new EdgeGrid(auth.clientToken, auth.clientSecret, auth.accessToken, auth.host, auth.debug);
    else
        _edge = new EdgeGrid({
            path: untildify(auth.path),
            section: auth.section,
            debug: auth.debug
        });

    return(_edge);
}

//Function to get a property
function _getProperty(queryObj, _edge) {
  return new Promise((resolve, reject) => {

    let request = {
      method: 'POST',
      path: '/papi/v1/search/find-by-value?accountSwitchKey=1-F78E',
      body: queryObj
    };

     _edge.auth(request);
     _edge.send(function (data, response) {
       if (response && response.statusCode >= 200 && response.statusCode < 400) {
         console.log(response.body);
         let parsed = JSON.parse(response.body);
         resolve(parsed);
       } else {
         reject(response);
       }
     })
  })
}

/**
* This code is from CLI Property
* Internal function to activate a property
*
* @param propertyLookup
* @param versionId
* @param env
* @param notes
* @param email
* @param acknowledgeWarnings
* @param autoAcceptWarnings
* @returns {Promise.<TResult>}
* @private
*/
function _activateProperty(propertyLookup, versionId, env = 'STAGING', notes = '', email = ['test@example.com'], acknowledgeWarnings = [], autoAcceptWarnings = true, _edge) {
  return _getProperty(propertyLookup, _edge)
      .then((data) => {
          //set basic data like contract & group
          const contractId = data.versions.items[0].contractId;
          const groupId = data.versions.items[0].groupId;
          const propertyId = data.versions.items[0].propertyId;
          const propertyName = data.versions.items[0].propertyName;

          console.log(data.versions.items[0].contractId);
          console.log(data.versions.items[0].groupId);
          console.log(data.versions.items[0].propertyId);
          console.log(data.versions.items[0].propertyName);

          return new Promise((resolve, reject) => {
              console.error(`... activating property (${propertyName}) v${versionId} on ${env}`);

              let activationData = {
                  propertyVersion: versionId,
                  network: env,
                  note: notes,
                  notifyEmails: email,
                  acknowledgeWarnings: acknowledgeWarnings,
                  complianceRecord: {
                      noncomplianceReason: 'NO_PRODUCTION_TRAFFIC'
                  }
              };

              let request = {
                  method: 'POST',
                  path: `/papi/v1/properties/${propertyId}/activations?contractId=${contractId}&groupId=${groupId}&accountSwitchKey=1-F78E`,
                  body: activationData
              };


              _edge.auth(request);

              _edge.send(function (data, response) {
                  if (response.statusCode >= 200 && response.statusCode <= 400) {
                      let parsed = JSON.parse(response.body);
                      resolve(parsed);
                  } else {
                      reject(response.body);
                  }
              });
          });
      })
      .then(body => {
          if (body.type && body.type.includes('warnings-not-acknowledged')) {
              let messages = [];
              console.error('... automatically acknowledging %s warnings!', body.warnings.length);
              body.warnings.map(warning => {
                  console.error('Warnings: %s', warning.detail);
                  //TODO report these warnings?
                  //console.trace(body.warnings[i]);
                  messages.push(warning.messageId);
              });
              //TODO: check that this doesn't happen more than once...
              return _activateProperty(propertyLookup, versionId, env, notes, email, messages, autoAcceptWarnings = true, _edge);
          } else
              //TODO what about errors?
              return new Promise((resolve, reject) => {
                  //TODO: chaise redirect?
                  let matches = !body.activationLink ? null : body.activationLink.match('activations/([a-z0-9_]+)\\b');

                  if (!matches) {
                      reject(body);
                  } else {
                      resolve(matches[1])
                  }
              });
      });
}