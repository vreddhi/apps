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
}
