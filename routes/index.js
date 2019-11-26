var express = require('express');
var router = express.Router();
var Rubidium = require('rubidium');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const sendmail = require('sendmail')();


router.use(bodyParser.urlencoded({ extended: true }));
/* GET home page. */
router.get('/', function(req, res, next) {
  var rb = new Rubidium();

  rb.on('job', job => console.log(job.message));
  rb.add({ time: Date.now() + 5000, message: '5 seconds have passed.' });

  //res.render('index', { title: "Vreddhi's test site" });
  res.setHeader('Cache-Control', 'no-store')
  res.sendFile(path.join(__dirname+'/apps.html'));
});

router.post('/users/:userId/books/:bookId', function (req, res) {
  res.send(req.params)
});


router.get('/submit', function(req, res) {
  let config_name = req.query.config_name;
  let config_version = req.query.config_version;
  let config_act_time = req.query.config_act_time;
  let config_spdr = req.query.config_spdr;
  let config_rev_email = req.query.config_rev_email;
  let config_sub_email = req.query.config_sub_email;
  let config_cus_email = req.query.config_cus_email;
  let config_notif_email = req.query.config_notif_email;
  let config_roll_version = req.query.config_roll_version;

  let final_string = config_name + ', ' + config_version + ', ' + config_act_time + ', ' + config_spdr + ', ' +
  config_rev_email + ', ' + config_sub_email + ', ' + config_cus_email + ', ' + config_notif_email + ', ' + config_roll_version


  var rb = new Rubidium();
  var x = new Boolean(true);

  rb.on('job', job => console.log(job.message));
  job = rb.add({ time: Date.now() + 5000, message: '5 seconds have passed.' },x);
  console.log(job['uuid']);


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
      db.run("CREATE TABLE IF NOT EXISTS ALL_ACTIVATIONS(job_id TEXT PRIMARY KEY, ldap TEXT, config_name TEXT, version INTEGER, date TEXT, status TEXT)",  insertData);
  };

  //Extract data from the view and store it in table
  //let job_id = job['uuid'];
  let random_num = Math.floor(Math.random() * 1000);
  let job_id = 'test_' + random_num.toString();
  let ldap = 'vbhat';
  let version = '1';
  let date = '23-11-2019 10:11:00 GMT';
  let status = 'PENDING';


  const insertData = () =>{

    var sql = `SELECT job_id job_id
                FROM ALL_ACTIVATIONS
                WHERE config_name = ?`;

      db.each(sql, [config_name], (err, row) => {
        if (err) {
          console.log('Unable to fetch data from table.');
        }
        console.log(`${row.job_id}`);
      });
      console.log("Insert data")
      db.run('INSERT INTO ALL_ACTIVATIONS VALUES (?,?,?,?,?,?)', job_id, ldap, config_name, version, date, status, (err, success) => {
        if (err) {
          // Send a response back saying, this is a duplicate schedule
          res.send('This is a duplicate schedule')
        } else {

          //Return user to confirmation page and send email
          res.setHeader('Cache-Control', 'no-store')
          res.sendFile(path.join(__dirname+'/apps_return.html'));
          //res.redirect(301, path.join(__dirname+'/apps_return.html'))

          //Send the Email
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
            '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">' + config_name.toString() + '</td>'+
            '      </tr>'+
            '      <tr style="color: #000; margin: 0; padding: 0;">'+
            '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; margin-top: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">Configuration Version</td>'+
            '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">' + config_version.toString() + '</td>'+
            '      </tr>'+
            '      <tr style="color: #000; margin: 0; padding: 0;">'+
            '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; margin-top: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">Activation Date and Time</td>'+
            '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">' + config_act_time.toString() + '</td>'+
            '      </tr>'+
            '      <tr style="color: #000; margin: 0; padding: 0;">'+
            '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; margin-top: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">SPDR Link</td>'+
            '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">' + config_spdr.toString() + '</td>'+
            '      </tr>'+
            '      <tr style="color: #000; margin: 0; padding: 0;">'+
            '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; margin-top: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">Reviewer Email</td>'+
            '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">' + config_rev_email.toString() + '</td>'+
            '      </tr>'+
            '      <tr style="color: #000; margin: 0; padding: 0;">'+
            '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; margin-top: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">Submitter Email</td>'+
            '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">' + config_sub_email.toString() + '</td>'+
            '      </tr>'+
            '      <tr style="color: #000; margin: 0; padding: 0;">'+
            '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; margin-top: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">Customer Email</td>'+
            '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">' + config_cus_email.toString() + '</td>'+
            '      </tr>'+
            '      <tr style="color: #000; margin: 0; padding: 0;">'+
            '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; margin-top: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">Notification Email(s)</td>'+
            '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">' + config_notif_email.toString() + '</td>'+
            '      </tr>'+
            '      <tr style="color: #000; margin: 0; padding: 0;">'+
            '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; margin-top: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">Rollback Version</td>'+
            '      <td style="font-size: 12px; font-family: Avenir, Helvetica, sans-serif; margin: 0; border-bottom: 1px solid #cccccc !important; padding: 10px 0 !important; text-align: left;">' + config_roll_version.toString() + '</td>'+
            '      </tr>'+
            '      </tbody>'+
            '      </table>'+
            '      <p>Click <span style="background-color: #2b2301; color: #fff; display: inline-block; padding: 3px 10px; font-weight: bold; border-radius: 5px;">HERE</span> to Cancel the Activation.     </p>'+
            '      <h2>NOTE:</h2>'+
            '      <ol>'+
            '      <li>Time represented is GMT time.</li>'+
            '      <li>Activation will be in the name of APPS auto user.</li>'+
            '      </ol>'+
            '      <p><strong>This is still in ALPHA stage. Fund something for full-fledged software :)</strong></p>'+
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
                to: config_sub_email,
                subject: 'Activation Schedule',
                html: html,
              }, function(err, reply) {
                console.log(err && err.stack);
                console.dir(reply);
            });

            //Send email to reviewer
            sendmail({
                from: 'scheduler@apps.com',
                to: config_rev_email,
                subject: 'Activation Schedule',
                html: html,
              }, function(err, reply) {
                console.log(err && err.stack);
                console.dir(reply);
            });

        }
      });
  };


});

module.exports = router;
