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
          var config_name_1 = row.config_name
          var config_version_1 = row.version
          var actvn_date_time = row.date
          var schedule_id = row.job_id
          var schedule_status = row.status
          console.log(`${row.job_id}`);
          var actvn_message = "Activation is sucessfully scheduled, details below."
          var submit_button = "disabled"
          res.render('main/searchresult' , { config_name_1, config_version_1,actvn_date_time, schedule_id, schedule_status,actvn_message });

          //invoke Activation
          //let activationResult = _activateProperty(searchObj, versionId, env, notes = '', email = ['vbhat@akamai.com'], acknowledgeWarnings = [], autoAcceptWarnings = true, _edge);

        });

      });

      config_name_1 = req.body['config_name_1']
      versionId = req.body['config_version_1']
      env = req.body['actvn_network']
      reviewer_email = req.body['reviewer_email']
      submitter_email = req.body['submitter_email']
      customer_email = req.body['customer_email']
      notification_email = req.body['notification_email']
      accountSwitchKey = req.body['account_switch_key']

      console.log('\nNew Lines')
      console.log(req.query.job_id)

      
      let activation_object = new activation()
      var test_it = activation_object.testit()
      console.log(test_it)
      var _edge = activation_object.setup();
      let searchObj = {"propertyName" : config_name_1 }
      //invoke Activation

      rb.add({ time: Date.now() + 5000, message: 'Scheduled Activation' });
      let responseText = 'Activation is scheduled'
      //res.render('main/searchresult', {config_name, config_version  });
      console.log('Scheduling Activation now')
      //activationResult = activation_object._activateProperty(searchObj, versionId, env, notes = '', email = [reviewer_email, submitter_email, notification_email], acknowledgeWarnings = [], autoAcceptWarnings = true, _edge, accountSwitchKey);
      console.log('Activated')
    }

  });

});
}
