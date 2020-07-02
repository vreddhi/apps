const activation = require('./activation.js')
const path = require('path');
const sqlite3 = require('sqlite3');
var Rubidium = require('rubidium');
var mail = require('./mail.js')
var database = require('./database.js')
var confirm = require('./confirm.js')

class reschedule {

  /*
  * Below constructor function is used to initialize the response text
  * @param : request object
  * @return : responseText
  */

  constructor(){
    this.response = {
      'responseText' : 'Reason: Generic Error',
      'updatedRows' : ''
    }
  }

  /**
  * Function to re-schedule a activation schedule on server restart
  * If only 1 entry is found, then this is valid, else reject outright
  * If valid, update DB to scheduled, and call approveJob via Rubidium to validate and schedule
  * Rubidium is a scheduler, technically its a callback at a pre-defined time.
  * @param {job_id} job_id - id of job
  * @returns {Promise.<TResult>}
  */

  _setReConfirmation(job_id) {
    return new Promise((resolve, reject) => {
      var confirm_object = new confirm ();
      var db = new database();
      db.setup()
        .then((data) => {
          var sql = `SELECT * FROM ALL_ACTIVATIONS
                      WHERE job_id = ?`;
          db._fetchMultipleRows(sql, [job_id])
            .then((result) => {
              console.log("Rescheduling job_id :"+ job_id);
              confirm_object._approveJob(result, db)
                .then((result) => {
                  this.response['responseText'] = 'Successfully Re-scheduled'
                  resolve(this.response)
                })
                .catch((result) => {
                  this.response['responseText'] = 'Failed to Re-Schedule for some API related reasons'
                  reject(this.response)
                })
            })
            .catch((result) => {
              this.response['responseText'] = 'DB fetch by job_id failed'
              reject(this.response)
            })
        })
        .catch((data) => {
          this.response['responseText'] = 'DB setup failed'
          reject(this.response)
        })
    });
  }

  // Call to find SCHEDULED jobs in database and add them to rubidium queue on server restart

  _rescheduleJobsOnServerStart() {
    return new Promise((resolve,reject) => {
      var db = new database();
      db.setup()
        .then((data) => {
          var sql = `SELECT date,job_id FROM ALL_ACTIVATIONS
                      WHERE status = ?`;
          var status = "SCHEDULED"
          db._fetchMultipleRows(sql, [status])
            .then((result) => {
              console.log("Total number of SCHEDULED jobs in db = " + result.length);
              if (result.length > 0) {
                for (var i = 0; i < result.length; i++) {
                  var job_date = new Date(result[i].date)
                  job_date = job_date.getTime();
                  var current_date = new Date();
                  current_date = current_date.getTime();
                  if (job_date > current_date) {
                    this._setReConfirmation(result[i].job_id)
                        .then((result) => {
                          this.response['responseText'] = 'Successfully Re-Scheduled'
                          resolve(this.response)
                        })
                        .catch((result) => {
                          this.response['responseText'] = 'Failed to re-schedule job'
                          reject(this.response)
                        })
                  } else {
                    this.response['responseText'] = 'Invalid job as schedule time is elapsed job_id: ' + result[i].job_id
                    resolve(this.response)
                  }
                }
              }
            })
            .catch((result) => {
              this.response['responseText'] = 'DB call to fetch SCHEDULED jobs failed'
              reject(this.response)
            })
        })
        .catch((data) => {
          this.response['responseText'] = 'DB setup failed'
          reject(this.response)
        })
    });
  }
}

module.exports = reschedule
