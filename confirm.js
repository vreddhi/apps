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
    this.response = {
      'responseText' : 'Reason: Generic Error'
    }
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
          console.log('Fetch count from DB')
          db._execute(sql, [req.query.job_id])
            .then((result) => {
              //DB query succeeded. Proceed for further steps
              //Get the config details from DB table
              if(result.total == 1) {
                console.log('Only 1 valid entry Found. Proceeding..')
                var sql = `UPDATE ALL_ACTIVATIONS
                            SET status = 'SCHEDULED'
                            WHERE job_id = ?`;
                db._updateTable(sql, [req.query.job_id])
                  .then((result) => {
                    //We are not interested in DB result values
                    //Proceed further if the query is success
                    console.log('Updated DB, fetching config details from DB')
                    var sql = `SELECT * FROM ALL_ACTIVATIONS
                                WHERE job_id = ?`;
                    db._fetchMultipleRows(sql, [req.query.job_id])
                      .then((result) => {
                        //Proceed further to schedule activation with details from database
                        console.log('Proceeding to schedule after initial checks')
                        this._approveJob(result, db)
                            .then((result) => {
                              this.response['responseText'] = 'Successfully Scheduled'
                              resolve(this.response)
                            })
                            .catch((result) => {
                              this.response['responseText'] = 'Failed to Schedule for some API related reasons'
                              reject(this.response)
                            })
                      })
                      .catch((result) => {
                        this.response['responseText'] = 'Reason: Unable to get details of configuration'
                        reject(this.response)
                      })
                  })
                  .catch((result) => {
                    this.response['responseText'] = 'Reason: Unable to update DB during confirmation'
                    reject(this.response)
                  })

              } else {
                console.log('More than 1 valid entry Found. Not Proceeding..')
                this.response['response'] = 'Activation is already scheduled.';
                reject(this.response)
              }
            })
            .catch((result) => {
              this.response['response'] = 'Unable to update the data table.';
              reject(this.response)
            })
        });
    })
  }

  /*
  * Below function is used to check DB tables and confirm the scheduling
  * @param : request object
  * @return : responseText
  */
  _approveJob(result, db) {
    return new Promise((resolve, reject) => {
          //Validate Property one last time with API calls and schedule it
          console.log(result)
          try {
            let config_name = result[0].config_name
            let versionId = result[0].version
            let actvn_date_time = result[0].date
            let env = result[0].network.toUpperCase()
            let notification_email = result[0].notification
            let submitter_email = result[0].submitter
            let reviewer_email = result[0].reviewer
            let accountSwitchKey = result[0].switchkey
            let schedule_status = result[0].status
            let job_id = result[0].job_id
            let notes = 'APPS'
            let autoAcceptWarnings = true
            let acknowledgeWarnings = []
            let email = [reviewer_email, submitter_email, notification_email]

            let searchObj = {"propertyName" : config_name }

            rb.on('job', job => {
                console.log(job.message)
                try {
                  let activation_object = new activation()
                  activation_object._setup()
                                   .then((data) => {
                                      activation_object._finalActivation(
                                                              db,
                                                              searchObj,
                                                              versionId,
                                                              env,
                                                              notes,
                                                              email,
                                                              acknowledgeWarnings,
                                                              autoAcceptWarnings,
                                                              accountSwitchKey,
                                                              job_id)
                                                        .then((data) => {console.log('Successfully Activated')})
                                                        .catch((data) => {console.log('Activation Failed')})      
                                   })


                } catch(err) {
                  //Failed activating for some reason
                  console.log(err)
                }
            });

            rb.add({ time: Date.now() + 1000, message: 'Scheduled Activation' });
            resolve('Success');
          }
          catch(err) {
            console.log(err)
            console.log('FAIL: Unable to find property')
            var sql = `UPDATE ALL_ACTIVATIONS
                      SET status = 'FAILED'
                      WHERE job_id = ?`;
            console.log(job_id)
            db._updateTable(sql, [job_id])
            reject(err)
          }

        });
  }

}

module.exports = confirm
