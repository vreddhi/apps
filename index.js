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

//GET search page
app.get('/cancel', function(req, res){

    res.render('main/cancel');

});

//POST to scheduler
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

  //Setup Database
  const dbPath = path.resolve(__dirname, 'apps.db')
  let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the APPS SQlite database.');
    createTable();
  });

  const createTable = () => {
      console.log("create database table ALL_ACTIVATIONS");
      db.run("CREATE TABLE IF NOT EXISTS ALL_ACTIVATIONS(job_id TEXT PRIMARY KEY, config_name TEXT, version INTEGER, date TEXT, status TEXT)",  insertData);
  };

  let random_num = Math.floor(Math.random() * 10000);
  let job_id = 'test_' + random_num.toString();

  const insertData = () => {

    var sql = `SELECT job_id job_id
                FROM ALL_ACTIVATIONS
                WHERE config_name = ?`;

      db.each(sql, [config_name_1], (err, row) => {
        if (err) {
          console.log('Unable to fetch data from table.');
        }
        console.log(`${row.job_id}`);
      });
      console.log("Insert data")
      var status = 'N';
      db.run('INSERT INTO ALL_ACTIVATIONS VALUES (?,?,?,?,?)', job_id, config_name_1, config_version_1, actvn_date_time, status, (err, success) => {
        if (err) {
          // Send a response back saying, this is a duplicate schedule
          //res.send('This is a duplicate schedule')
        } else {
          //Return user to confirmation page and send email
          //next()
          //res.redirect(301, path.join(__dirname+'/apps_return.html'))
        }
      });
  };

  confirm_link = "http://localhost:3000/confirm?job_id=" + job_id

  var html = '<html>'+
  '<head>'+
  '	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'+
  '	<title>3 Column Layout</title>'+
  '	<style type="text/css">'+
  ''+
  '		/* Layout */'+
  '		body {'+
  '			min-width: 630px;'+
  '		}'+
  ''+
  '		#container {'+
  '			padding-left: 200px;'+
  '			padding-right: 190px;'+
  '		}'+
  '		'+
  '		#container .column {'+
  '			position: relative;'+
  '			float: left;'+
  '		}'+
  '		'+
  '		#center {'+
  '			padding: 10px 20px;'+
  '			width: 100%;'+
  '		}'+
  '		'+
  '		#left {'+
  '			width: 180px;'+
  '			padding: 0 10px;'+
  '			right: 240px;'+
  '			margin-left: -100%;'+
  '		}'+
  '		'+
  '		#right {'+
  '			width: 130px;'+
  '			padding: 0 10px;'+
  '			margin-right: -100%;'+
  '		}'+
  '		'+
  '		#footer {'+
  '			clear: both;'+
  '		}'+
  '		'+
  '		/* IE hack */'+
  '		* html #left {'+
  '			left: 150px;'+
  '		}'+
  ''+
  '		/* Make the columns the same height as each other */'+
  '		#container {'+
  '			overflow: hidden;'+
  '		}'+
  ''+
  '		#container .column {'+
  '			padding-bottom: 1001em;'+
  '			margin-bottom: -1000em;'+
  '		}'+
  ''+
  '		/* Fix for the footer */'+
  '		* html body {'+
  '			overflow: hidden;'+
  '		}'+
  '		'+
  '		* html #footer-wrapper {'+
  '			float: left;'+
  '			position: relative;'+
  '			width: 100%;'+
  '			padding-bottom: 10010px;'+
  '			margin-bottom: -10000px;'+
  '			background: #fff;'+
  '		}'+
  ''+
  '		/* Aesthetics */'+
  '		body {'+
  '			margin: 0;'+
  '			padding: 0;'+
  '			font-family:Sans-serif;'+
  '			line-height: 1.5em;'+
  '		}'+
  '		'+
  '		p {'+
  '			color: #555;'+
  '		}'+
  ''+
  '		nav ul {'+
  '			list-style-type: none;'+
  '			margin: 0;'+
  '			padding: 0;'+
  '		}'+
  '		'+
  '		nav ul a {'+
  '			color: darkgreen;'+
  '			text-decoration: none;'+
  '		}'+
  ''+
  '		#header, #footer {'+
  '			font-size: large;'+
  '			padding: 0.3em;'+
  '			background: #BCCE98;'+
  '		}'+
  ''+
  '		#left {'+
  '			background: #DAE9BC;'+
  '		}'+
  '		'+
  '		#right {'+
  '			background: #F7FDEB;'+
  '		}'+
  ''+
  '		#center {'+
  '			background: #fff;'+
  '		}'+
  ''+
  '		#container .column {'+
  '			padding-top: 1em;'+
  '		}'+
  '		'+
  '	</style>'+
  '	'+
  '</head>'+
  ''+
  '<body>'+
  ''+
  '	<header id="header"><p></p></header>'+
  ''+
  '	<div id="container">'+
  ''+
  '		<main id="center" class="column">'+
  '			<article>'+
  '			'+
  '      <h2 style="color: #2e6c80;">Here are the details of Activation Scheduled for you</h2>'+
  '      <p>Below are the details of configuration that will be scheduled to activate. </p>'+
  '      <h2 style="color: #2e6c80;">Details:</h2>'+
  '      <table style="font-family: Avenir, Helvetica, sans-serif; border-collapse: collapse; padding: 0;" cellspacing="0" cellpadding="0">'+
  '      <thead style="font-family: Avenir, Helvetica, sans-serif; margin-top: 0;">'+
  '      <tr style="color: #000; margin: 0; padding: 0; margin-top: 0; margin-bottom: 0;">'+
  '      <th style="border-bottom: 1px solid #cccccc; font-weight: bold; color: #f2a489; margin: 0; font-size: 12px; padding-top: 15px; font-family: Avenir, Helvetica, sans-serif; margin-top: 0; text-align: left;">Name</th>'+
  '      <th style="border-bottom: 1px solid #cccccc; font-weight: bold; color: #f2a489; margin: 0; font-size: 12px; padding-top: 15px; font-family: Avenir, Helvetica, sans-serif; text-align: left;">Value</th>'+
  '      </tr>'+
  '      </thead>'+
  '      <tbody style="font-family: Avenir, Helvetica, sans-serif; margin-bottom: 0;">'+
  '      <tr style="color: #000; margin: 0; padding: 0; margin-top: 0;">'+
  '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; margin-top: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">Configuration Name</td>'+
  '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">' + config_name_1.toString() + '</td>'+
  '      </tr>'+
  '      <tr style="color: #000; margin: 0; padding: 0;">'+
  '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; margin-top: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">Configuration Version</td>'+
  '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">' + config_version_1.toString() + '</td>'+
  '      </tr>'+
  '      <tr style="color: #000; margin: 0; padding: 0;">'+
  '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; margin-top: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">Activation Date and Time</td>'+
  '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">' + actvn_date_time.toString() + '</td>'+
  '      </tr>'+
  '      <tr style="color: #000; margin: 0; padding: 0;">'+
  '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; margin-top: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">SPDR Link</td>'+
  '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">' + sdpr_link.toString() + '</td>'+
  '      </tr>'+
  '      <tr style="color: #000; margin: 0; padding: 0;">'+
  '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; margin-top: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">Reviewer Email</td>'+
  '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">' + reviewer_email.toString() + '</td>'+
  '      </tr>'+
  '      <tr style="color: #000; margin: 0; padding: 0;">'+
  '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; margin-top: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">Submitter Email</td>'+
  '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">' + submitter_email.toString() + '</td>'+
  '      </tr>'+
  '      <tr style="color: #000; margin: 0; padding: 0;">'+
  '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; margin-top: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">Customer Email</td>'+
  '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">' + customer_email.toString() + '</td>'+
  '      </tr>'+
  '      <tr style="color: #000; margin: 0; padding: 0;">'+
  '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; margin-top: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">Notification Email(s)</td>'+
  '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">' + notification_email.toString() + '</td>'+
  '      </tr>'+
  '      <tr style="color: #000; margin: 0; padding: 0;">'+
  '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; margin-top: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">Rollback Version</td>'+
  '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">' + customer_email.toString() + '</td>'+
  '      </tr>'+
  '      </tbody>'+
  '      </table>'+
  '      <p>Click <span href="' + confirm_link + '" style="background-color: #2b2301; color: #fff; display: inline-block; padding: 3px 10px; font-weight: bold; border-radius: 5px;">HERE</span> to Confirm the Activation.     </p>'+
  '      <p> If you are unable to click. Copy and paste the below URL in your browser.' + confirm_link + '</p>'
  '      <h2>NOTE:</h2>'+
  '      <ol>'+
  '      <li>Time represented is GMT time.</li>'+
  '      <li>Activation will be in the name of APPS auto user.</li>'+
  '      </ol>'+
  '      <p><strong>This is still in ALPHA stage.</strong></p>'+
  '			'+
  '			</article>								'+
  '		</main>'+
  ''+
  '		<nav id="left" class="column"></nav>'+
  ''+
  '		<div id="right" class="column"></div>'+
  ''+
  '	</div>'+
  ''+
  '	<div id="footer-wrapper">'+
  '		<footer id="footer"><p></p></footer>'+
  '	</div>'+
  ''+
  '</body>'+
  ''+
  '</html>';

  sendmail({
      from: 'scheduler@apps.com',
      to: submitter_email,
      subject: 'Activation Schedule',
      html: html,
    }, function(err, reply) {
      console.log(err && err.stack);
      console.dir(reply);
  });

  reviewer_email = submitter_email;
  sendmail({
      from: 'scheduler@apps.com',
      to: reviewer_email,
      subject: 'Activation Schedule',
      html: html,
    }, function(err, reply) {
      console.log(err && err.stack);
      console.dir(reply);
  });

  next()
}

app.use('/scheduler',scheduleJob)

app.post('/scheduler', (req, res) => {
  responseText = 'Config activation for  ' + req.body['config_name_1'] + ' will be scheduled subject to Reviewer\'s email approval.'
  console.log('Control is in scheduler call');
  res.render('main/schedulerresult', {responseText});
});

//GET to confirm activation from Reviewer
app.get('/confirm', (req,res) => {
  console.log(req.query);

  //Setup DB Again
  const dbPath = path.resolve(__dirname, 'apps.db')
  let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the APPS SQlite database.');
  });

  var sql = `UPDATE ALL_ACTIVATIONS
              SET status = 'Y'
              WHERE job_id = ?`;
  db.run(sql, [req.query['job_id']], (err, succes) => {
    if (err) {
      console.log(err);
      console.log('The confirmation link is invalid.');
      //res.send('Link is Invalid');
    } else {
      //res.send('All Good.')
      rb.on('job', job => {
        console.log(job.message)
        var sql = `SELECT *
                    FROM ALL_ACTIVATIONS
                    WHERE job_id = ?`;

        db.each(sql, [req.query['job_id']], (err, row) => {
          if (err) {
            console.log('Unable to fetch data from table.');
          }
          //console.log(`${row}`);
          var config_name = row.config_name
          var config_version = row.version
          console.log(`${row.job_id}`);
          _edge = setup();

          let searchObj = {"propertyName" : config_name }
          //propertyDetails = _getProperty(searchObj, _edge);

          let versionId = config_version;
          console.log(config_version);
          let env = 'STAGING';

          let activation_command = 'akamai property activate ' +
                                    config_name + ' --propVer ' +
                                    config_version +
                                    ' --network STAGING --email vbhat@akamai.com --account-key 1-5C0YLB';
          exec(activation_command, (err, stdout, stderr) => {
            if (err) {
              // node couldn't execute the command
              console.log(err);
              return;
            }

            // the *entire* stdout and stderr (buffered)
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
          });
          //invoke Activation
          //let activationResult = _activateProperty(searchObj, versionId, env, notes = '', email = ['vbhat@akamai.com'], acknowledgeWarnings = [], autoAcceptWarnings = true, _edge);

        });

      });

      rb.add({ time: Date.now() + 5000, message: 'Scheduled Activation' });
      let responseText = 'Activation is scheduled'
      res.render('main/confirmresult', {responseText});
    }

  });

});


//POST to search activations
var searchJob = function (req, res, next) {
  schedule_id = req.body.schedule_id ;
  next()
}

app.use(searchJob)

app.post('/search', (req, res) => {
  //console.log(res.body)

  const dbPath = path.resolve(__dirname, 'apps.db')
  let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the APPS SQlite database.');
  });

  var sql = `SELECT *
              FROM ALL_ACTIVATIONS
              WHERE job_id = ? `;
  db.each(sql, [schedule_id], (err, row) => {
    if (err) {
      console.log(err);
      console.log('unable to fecth data from table.');
    } else {
      var config_name_1 = row.config_name
      var config_version_1 = row.version
      var actvn_date_time = row.date
      var schedule_id = row.job_id
      res.render('main/searchresult', { config_name_1, config_version_1,actvn_date_time, schedule_id });
     }
   })

})

//POST to Cancel schedule
var cancelSchedule = function (req, res, next) {
  schedule_id = req.body.schedule_id ;

  next()
}

app.use(cancelSchedule)

app.post('/cancelschedule', (req, res) => {
      console.log('here5');


  const dbPath = path.resolve(__dirname, 'apps.db')
  let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the APPS SQlite database.');
  });

    var sql = `UPDATE ALL_ACTIVATIONS
              SET status = 'N'
              WHERE job_id = ?`;
   console.log(schedule_id);          
  db.run(sql, [schedule_id], (err, success) => {
    if (err) {
      console.log(err);
      console.log('The confirmation link is invalid.');
      res.send('Link is Invalid');
    } else {
    res.render('main/cancelscheduleconfirmation', {schedule_id} );
    }

    })  
})

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
