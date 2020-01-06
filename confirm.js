const activation = require('./activation.js')
const path = require('path');
const sqlite3 = require('sqlite3');
var Rubidium = require('rubidium');
var rb = new Rubidium();
var database = require('./database.js')

class confirm {

  /*
  * Below constructor function is used to initialize the response text
  * @param : request object
  * @return : responseText
  */
  constructor(){
    this.responseText = 'Reason: Generic Error';
  }

  /*
  * Below function is used to check DB tables and confirm the scheduling
  * @param : request object
  * @return : responseText
  */
  _setConfirmation(req) {
    return new Promise((resolve, reject) => {
      var db = new database();
      db.setup()
        .then((data) => {
          var sql = `select count(*) as total from ALL_ACTIVATIONS
                        WHERE job_id = ? and status = 'PENDING_APPROVAL'`;
          db._execute(sql, [req.query.job_id])
            .then((result) => {
              //DB query succeeded. Proceed for further steps
              //Get the config details from DB table
              if(result.total == 1) {
                var sql = `UPDATE ALL_ACTIVATIONS
                            SET status = 'SCHEDULED'
                            WHERE job_id = ?`;
                db._execute(sql, [req.query.job_id])
                  .then((result) => {
                    //We are not interested in DB result values
                    //Proceed further if the query is success
                    var sql = `SELECT * FROM ALL_ACTIVATIONS
                                WHERE job_id = ?`;
                    db._execute(sql, [req.query.job_id])
                      .then((result) => {
                        //Proceed further to schedule activation with details from database
                        this._approveJob(result);
                      })
                      .catch((result) => {
                        this.responseText = 'Reason: Unable to get details of configuration'
                        reject(this.responseText)
                      })
                  })
                  .catch((result) => {
                    this.responseText = 'Reason: Unable to update DB during confirmation'
                    reject(this.responseText)
                  })

              } else {
                this.responseText = 'Activation cannot be scheduled due to mis-match in table entries.';
                reject(this.responseText)
              }
            })
            .catch((result) => {
              console.log('Reason: Activation is not pending for APPROVAL.')
              reject(this.responseText)
            })
        });
    })
  }

  /*
  * Below function is used to check DB tables and confirm the scheduling
  * @param : request object
  * @return : responseText
  */
  _approveJob(result) {
    return new Promise((resolve, reject) => {
          //Validate Property one last time with API calls and schedule it
          config_name = result[0].config_name
          versionId = result[0].version
          actvn_date_time = result[0].date
          env = result[0].network.toUpperCase()
          notification_email = result[0].notification
          submitter_email = result[0].submitter
          reviewer_email = result[0].reviewer
          accountSwitchKey = result[0].switchkey
          schedule_status = result[0].status

          let searchObj = {"propertyName" : config_name }
          scheduleId = result[0].job_id
          rb.on('job', job => {
              let activationResult = activation_object._activateProperty_dbcheck(
                                      searchObj,
                                      versionId,
                                      env,
                                      notes = 'APPS',
                                      email = [reviewer_email, submitter_email, notification_email],
                                      acknowledgeWarnings = [],
                                      autoAcceptWarnings = true,
                                      _edge,
                                      accountSwitchKey,
                                      scheduleId);
            });
          rb.add({ time: new Date(actvn_date_time).getTime(), message: 'Scheduled Activation' });
          resolve('Success');
        });
  }

}

module.exports = confirm
