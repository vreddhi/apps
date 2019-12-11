const path = require('path');
const sqlite3 = require('sqlite3');

module.exports = function(app){


app.get('/cancelschedule', (req, res) => {
      console.log('in cancelschedule.js');


  const dbPath = path.resolve(__dirname, 'apps.db')
  let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the APPS SQlite database.');
  });

    var sql = `UPDATE ALL_ACTIVATIONS
              SET status = 'CANCELLED'
              WHERE job_id = ?`;
   console.log(schedule_id);          
  db.run(sql, [schedule_id], (err, success) => {
    if (err) {
      console.log(err);
      console.log('The confirmation link is invalid.');
      res.send('Link is Invalid');
    } else {
        var sql = `SELECT *
                    FROM ALL_ACTIVATIONS
                    WHERE job_id = ?`;

        db.each(sql, [schedule_id], (err, row) => {
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
          var actvn_message = "Activation is sucessfully cancelled, details below."
          var submit_button = "disabled"
          res.render('main/searchresult' , { config_name_1, config_version_1,actvn_date_time, schedule_id, schedule_status,actvn_message, submit_button });

          //invoke Activation
          //let activationResult = _activateProperty(searchObj, versionId, env, notes = '', email = ['vbhat@akamai.com'], acknowledgeWarnings = [], autoAcceptWarnings = true, _edge);

        });  
    }

    })  
})

}