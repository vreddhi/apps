const path = require('path');
const sqlite3 = require('sqlite3');

class database {
  /*
  * Below function is used to instantiate the database
  *
  */
  setup() {
    return new Promise((resolve,reject) => {
        const dbPath = path.resolve(__dirname, 'apps.db')
        this.db_connection = new sqlite3.Database(dbPath, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Connected to database')
            resolve('Connected to database');
          }
      });
    });
  }

  /*
  * Below function is used to instantiate the database
  *
  */
  _shutdown() {
    return new Promise((resolve,reject) => {
        this.db_connection.close(function callbacK() {
          resolve('DB Connection closed')
        })
    });
  }

  /*
  * Below function is used to create a table
  * @param : table_name
  */
  createTable(table_name) {
    return new Promise((resolve, reject) => {
      console.log("create database table " + table_name);
      this.db_connection.run('CREATE TABLE IF NOT EXISTS ' + table_name + '(job_id TEXT PRIMARY KEY, \
                                                            config_name TEXT, \
                                                            version INTEGER, \
                                                            date TEXT, \
                                                            sdpr TEXT, \
                                                            reviewer TEXT, \
                                                            submitter TEXT, \
                                                            customer TEXT, \
                                                            notification TEXT, \
                                                            switchkey TEXT, \
                                                            network TEXT, \
                                                            status TEXT)');
      resolve('Table Created')
    })

  }

  /*
  * Below function is used to insert data to a table
  * @param : job_id,config_name, config_version, actvn_date_time,
  *          sdpr_link, reviewer_email, submitter_email, customer_email,
  *          notification_email, account_switch_key, actvn_network, status
  * @return : True/False
  */
  insertData(job_id,config_name, config_version, actvn_date_time,
              sdpr_link, reviewer_email, submitter_email, customer_email,
              notification_email, account_switch_key, actvn_network, status) {
      return new Promise((resolve, reject) => {
        console.log('Inserting data');
        this.db_connection.run('INSERT INTO ALL_ACTIVATIONS VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
                job_id, config_name, config_version, actvn_date_time, sdpr_link,
                reviewer_email, submitter_email, customer_email, notification_email,
                account_switch_key, actvn_network, status, (err, success) => {
                  if (err) {
                      console.log('error inserting data.');
                      reject(new Boolean(false))
                  } else {
                      console.log('success inserting data.');
                      resolve(new Boolean(true))
                  }
                });

      });
  }

  /*
  * Below function is used to execute DB query
  * @param : params
  * @return : Return result
  */
  _execute(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db_connection.each(sql, params, (err, result) => {
        if (err) {
          console.log('Error running sql: ' + sql)
          console.log(err)
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }


  /*
  * Below function is used to fetch multiple rows
  * @param : params
  * @return : Return result with multiple row
  */
  _fetchMultipleRows(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db_connection.all(sql, params, (err, result) => {
        if (err) {
          console.log('Error running sql: ' + sql)
          console.log(err)
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  /*
  * Below function is used to updata a table
  * @param : params
  *
  */
  _updateTable(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db_connection.run(sql, params, function(err, result) {
        if (err) {
          console.log('Error running sql: ' + sql)
          console.log(err)
          reject(err)
        } else {
          //changes is the property of sqlite3 library
          resolve(this.changes)
        }
      })
    })
  }

  /*
  * Below function is used to insert data to a table
  * @param : table_name
  * @return : Return -1 if failed, else total rows fetched
  */
  fetchRowCount(table_name, config_name, config_version, status) {
    return new Promise((resolve, reject) => {
      var sql = 'SELECT count(*) as total FROM ' + table_name + ' WHERE config_name = ? \
                  and version = ? and status = ?';
      var result = -1
      console.log('Fetching count');
      this.db_connection.each(sql, [config_name, config_version, status], (err, row) => {
          if (err) {
            console.log(err);
            console.log('Unable to fecth data from table.');
            reject(result)
          } else {
            result = row.total
            resolve(result)
          }
       });


    });
  }

}

module.exports = database
