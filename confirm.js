const activation = require('./activation.js')
const path = require('path');
const sqlite3 = require('sqlite3');
var Rubidium = require('rubidium');
var rb = new Rubidium();

module.exports = function(app){


app.get('/confirm', (req,res) => {


const dbPath = path.resolve(__dirname, 'apps.db')
  let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the APPS SQlite database.');
  });

var total_check_sql = `select count(*) as total from ALL_ACTIVATIONS 
              WHERE job_id = ? and status = "PENDING_APPROVAL"`;
  db.each(total_check_sql, [req.query.job_id], (err, row) => {
    if (err) {
      console.log(err);
      console.log('The confirmation link is invalid.');
      res.send('error');
    } else {
      var total_check_sql_result = row.total  
      if (total_check_sql_result == 1) {
        approveJob();

      } else{
        cannotApproveJob();
      };
    }

    });

  function approveJob(){

        console.log("Activation is sucessfully scheduled, details below")

          var sql = `UPDATE ALL_ACTIVATIONS
              SET status = 'SCHEDULED'
              WHERE job_id = ?  `;
          db.run(sql, [req.query.job_id], (err, success) => {
            if (err) {
              console.log(err);
              console.log('The confirmation link is invalid.');
              //res.send('Link is Invalid');
            } else {
          //res.send('All Good.')
          var sql = `SELECT *
                      FROM ALL_ACTIVATIONS
                      WHERE job_id = ?`;

          var data = [];
          console.log(req.query.job_id)
          db.each(sql, [req.query.job_id], (err, row) => {
            if (err) {
              console.log('Unable to fetch data from table.');
            } else {
              data.push(row);

            }
          }, function() {
            console.log('****************')
            console.log(data);
            if(data.length < 1) {
              //Have a no result page here
            } else {
              //Valid case so schedule it
              let activation_object = new activation()
              var _edge = activation_object.setup();

              actvn_message = 'Activation is sucessfully scheduled, details below.'
              config_name_1 = data[0].config_name
              versionId = data[0].version
              actvn_date_time = data[0].date
              env = data[0].network.toUpperCase()
              notification_email = data[0].notification
              submitter_email = data[0].submitter
              reviewer_email = data[0].reviewer
              accountSwitchKey = data[0].switchkey
              data[0].submit_status = "disabled"
              schedule_status = data[0].status

              let searchObj = {"propertyName" : config_name_1 }
              scheduleId = data[0].job_id
              rb.on('job', job => {
                  console.log('Activating config now')

                  let activationResult = activation_object._activateProperty_dbcheck(searchObj, versionId, env, notes = 'APPS', email = [reviewer_email, submitter_email, notification_email], acknowledgeWarnings = [], autoAcceptWarnings = true, _edge, accountSwitchKey, scheduleId);
    
                });

              res.render('main/searchresult' , { data,actvn_message});
              var actvn_date_time_epoch = new Date(actvn_date_time);
              actvn_date_time_epoch = actvn_date_time_epoch.getTime();
              console.log("actvn_date_time = "+actvn_date_time)
              console.log("actvn_date_time_epoch = "+actvn_date_time_epoch)
              rb.add({ time: actvn_date_time_epoch, message: 'Scheduled Activation' });
            }

          });

        }

    });

  }

  function cannotApproveJob(){
        console.log("This schedule is not awaiting your approval")
          var sql = `SELECT *
                      FROM ALL_ACTIVATIONS
                      WHERE job_id = ?`;
          var data = [];
          console.log(req.query.job_id)
          db.each(sql, [req.query.job_id], (err, row) => {
            if (err) {
              console.log('Unable to fetch data from table.');
            } else {
              data.push(row);
            }
          }, function() {
              actvn_message = 'This schedule is not awaiting your approval.'
              data[0].submit_status = "disabled"
              text_danger = "text-danger"
              res.render('main/searchresult' , { data,actvn_message,text_danger});
          });

  }

  });

}
