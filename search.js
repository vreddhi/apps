const path = require('path');
const sqlite3 = require('sqlite3');
var database = require('./database.js')

class search {
  /*
  * Below function is used to instantiate a response object
  *
  */
  constructor() {
    //Initialize a negative response and empty data array
    this.response = {
      'responseText' : 'Search Failed',
      'queryResult' : []
    }
  }

  /**
  * Below function is used to find scheduled data for a configuration
  * @param : config_name
  **/
  _findSchedule(config_name) {
    return new Promise((resolve, reject) => {
      var db = new database();
      db.setup()
        .then((data) => {
            var sql = `SELECT *
                    FROM ALL_ACTIVATIONS
                    WHERE config_name = ? `;
            db._fetchMultipleRows(sql, [config_name])
              .then((result) => {
                //DB Query response is a list/array of rows
                this.response['queryResult'] = result
                resolve(this.response)
              })
              .catch((result) => {
                reject(this.response)
              })
        })
    })

  }

  /*
  * Below function is used to find scheduled data for a configuration by job_id
  * @param : config_name
  */
  _findScheduleByJobId(job_id) {
    return new Promise((resolve, reject) => {
      var db = new database();
      db.setup()
        .then((data) => {
            var sql = `SELECT *
                    FROM ALL_ACTIVATIONS
                    WHERE job_id = ? `;
            db._fetchMultipleRows(sql, [job_id])
              .then((result) => {
                //DB Query response is a list/array of rows
                this.response['queryResult'] = result
                resolve(this.response)
              })
              .catch((result) => {
                reject(this.response)
              })
        })
    })

  }
}

module.exports = search
