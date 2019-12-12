const activation = require('./activation.js')
const path = require('path');
const sqlite3 = require('sqlite3');
var Rubidium = require('rubidium');
var rb = new Rubidium();

module.exports = function(app){


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
              SET status = 'SCHEDULED'
              WHERE job_id = ?`;
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

              actvn_message = 'Activatin using APPS'
              job_id = data[0].job_id
              status = data[0].status
              config_name_1 = data[0].config_name
              versionId = data[0].version
              actvn_date_time = data[0].date
              env = data[0].network.toUpperCase()
              notification_email = data[0].notification
              submitter_email = data[0].submitter
              reviewer_email = data[0].reviewer
              accountSwitchKey = data[0].switchkey

              let searchObj = {"propertyName" : config_name_1 }
              rb.on('job', job => {
                  console.log('Activating config now')
                  let activationResult = activation_object._activateProperty(searchObj, versionId, env, notes = 'APPS', email = [reviewer_email, submitter_email, notification_email], acknowledgeWarnings = [], autoAcceptWarnings = true, _edge, accountSwitchKey);
                });

              res.render('main/searchresult' , { config_name_1, versionId ,actvn_date_time, job_id, status,actvn_message });
              rb.add({ time: Date.now() + 2000, message: 'Scheduled Activation' });
            }

          });

        }

    });

  });

}
