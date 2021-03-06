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
      'responseText' : 'The confirmation link is invalid.',
      'updatedRows' : ''
    }
  }

  /**
  * Function to cancel a activation schedule
  * Update table ALL_ACTIVATIONS
  *
  * @param {string} job_id - propetyId of configuration
  * @returns {Promise.<TResult>}
  */
  _cancelSchedule(job_id) {
    return new Promise((resolve, reject) => {
      var db = new database();
      db.setup()
        .then((result) => {
          var sql = `UPDATE ALL_ACTIVATIONS
                    SET status = 'CANCELLED'
                    WHERE job_id = ? AND status != 'CANCELLED'`;
          db._updateTable(sql, [job_id])
            .then((result) => {
              this.response['responseText'] = 'Successfully updated the schedule.'
              this.response['updatedRows'] = result
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
