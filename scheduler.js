const path = require('path');
const sqlite3 = require('sqlite3');
const sendmail = require('sendmail')();

var Rubidium = require('rubidium');
var rb = new Rubidium();

module.exports = function(app){

app.post('/scheduler', (req, res) => {



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
  ' <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">'+
  ' <title>3 Column Layout</title>'+
  ' <style type="text/css">'+
  ''+
  '   /* Layout */'+
  '   body {'+
  '     min-width: 630px;'+
  '   }'+
  ''+
  '   #container {'+
  '     padding-left: 200px;'+
  '     padding-right: 190px;'+
  '   }'+
  '   '+
  '   #container .column {'+
  '     position: relative;'+
  '     float: left;'+
  '   }'+
  '   '+
  '   #center {'+
  '     padding: 10px 20px;'+
  '     width: 100%;'+
  '   }'+
  '   '+
  '   #left {'+
  '     width: 180px;'+
  '     padding: 0 10px;'+
  '     right: 240px;'+
  '     margin-left: -100%;'+
  '   }'+
  '   '+
  '   #right {'+
  '     width: 130px;'+
  '     padding: 0 10px;'+
  '     margin-right: -100%;'+
  '   }'+
  '   '+
  '   #footer {'+
  '     clear: both;'+
  '   }'+
  '   '+
  '   /* IE hack */'+
  '   * html #left {'+
  '     left: 150px;'+
  '   }'+
  ''+
  '   /* Make the columns the same height as each other */'+
  '   #container {'+
  '     overflow: hidden;'+
  '   }'+
  ''+
  '   #container .column {'+
  '     padding-bottom: 1001em;'+
  '     margin-bottom: -1000em;'+
  '   }'+
  ''+
  '   /* Fix for the footer */'+
  '   * html body {'+
  '     overflow: hidden;'+
  '   }'+
  '   '+
  '   * html #footer-wrapper {'+
  '     float: left;'+
  '     position: relative;'+
  '     width: 100%;'+
  '     padding-bottom: 10010px;'+
  '     margin-bottom: -10000px;'+
  '     background: #fff;'+
  '   }'+
  ''+
  '   /* Aesthetics */'+
  '   body {'+
  '     margin: 0;'+
  '     padding: 0;'+
  '     font-family:Sans-serif;'+
  '     line-height: 1.5em;'+
  '   }'+
  '   '+
  '   p {'+
  '     color: #555;'+
  '   }'+
  ''+
  '   nav ul {'+
  '     list-style-type: none;'+
  '     margin: 0;'+
  '     padding: 0;'+
  '   }'+
  '   '+
  '   nav ul a {'+
  '     color: darkgreen;'+
  '     text-decoration: none;'+
  '   }'+
  ''+
  '   #header, #footer {'+
  '     font-size: large;'+
  '     padding: 0.3em;'+
  '     background: #BCCE98;'+
  '   }'+
  ''+
  '   #left {'+
  '     background: #DAE9BC;'+
  '   }'+
  '   '+
  '   #right {'+
  '     background: #F7FDEB;'+
  '   }'+
  ''+
  '   #center {'+
  '     background: #fff;'+
  '   }'+
  ''+
  '   #container .column {'+
  '     padding-top: 1em;'+
  '   }'+
  '   '+
  ' </style>'+
  ' '+
  '</head>'+
  ''+
  '<body>'+
  ''+
  ' <header id="header"><p></p></header>'+
  ''+
  ' <div id="container">'+
  ''+
  '   <main id="center" class="column">'+
  '     <article>'+
  '     '+
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
  '     '+
  '     </article>                '+
  '   </main>'+
  ''+
  '   <nav id="left" class="column"></nav>'+
  ''+
  '   <div id="right" class="column"></div>'+
  ''+
  ' </div>'+
  ''+
  ' <div id="footer-wrapper">'+
  '   <footer id="footer"><p></p></footer>'+
  ' </div>'+
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

responseText = 'Config activation for  ' + req.body['config_name_1'] + ' will be scheduled subject to Reviewer\'s email approval..'

console.log('Control is in scheduler call');
res.render('main/schedulerresult', {responseText});

  })


}