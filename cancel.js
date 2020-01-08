const path = require('path');
const sqlite3 = require('sqlite3');
var database = require('./database.js')

class cancel {
  /*
  * Below function is used to instantiate a response object
  *
  */
  constructor() {
    //Initialize a negative response
    this.response = {
      'responseText' : 'The confirmation link is invalid.'
    }
  }

  /*
  * Below function is used to cancel a schedule
  * @param : scheduleId
  */
  _cancelSchedule(job_id) {
    return new Promise((resolve, reject) => {
      var db = new database();
      db.setup()
        .then((result) => {
          var sql = `UPDATE ALL_ACTIVATIONS
                    SET status = 'CANCELLED'
                    WHERE job_id = ?`;
          console.log(job_id)
          db._updateTable(sql, [job_id])
            .then((result) => {
              this.response['responseText'] = 'Successfully updated the schedule.'
              resolve(this.response)
            })
            .catch((result) => {
              this.response['responseText'] = 'The confirmation link is invalid.'
              reject(this.response)
            })
        })
        .catch((result) => {
          reject(this.response)
        })
    })

  }

}

module.exports = cancel
