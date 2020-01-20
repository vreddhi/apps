var database = require('./database.js')

class user {

  constructor() {
    this.response = {
      'responseText' : 'Failed: Generic Failure',
      'data' : null
    }
  }


  _createTable() {
    return new Promise((resolve, reject) => {
      var db = new database();
      db.setup()
        .then((data) => {
          var sql = 'CREATE TABLE IF NOT EXISTS USERS(user_name TEXT PRIMARY KEY, \
                                                                password TEXT, \
                                                                role TEXT, \
                                                                id TEXT, \
                                                                status TEXT)';
          db._runSql(sql)
            .then((data) => {
              resolve('Table created')
            })
        })
    })

  }

  /**
  * This is sleep function
  * @param time
  * @returns {Promise.<TResult>}
  * @private
  */
  _sleep(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
  }

  _createUser(user_name,password) {
    return new Promise((resolve, reject) => {
      var db = new database();
      db.setup()
        .then((data) => {
          var id = Math.floor(Math.random() * 10000).toString();
          var sql = `INSERT INTO USERS VALUES (?,?,'USER',?,'INACTIVE')`;
          console.log('Fetch user from DB')
          db._runSql(sql, [user_name,password,id])
            .then((data) => {
              //Some FAKE Wait time :)
              this._sleep(4000)
                  .then(() => {
                    this.response['responseText'] = 'User Created, Please wait for Approval'
                    resolve(this.response)
                  })
            })
            .catch((data) => {
              this.response['responseText'] = 'Unable to Create user'
              reject(this.response)
            })
        })
    })
  }

  _getUser(user_name,secret,status) {
    return new Promise((resolve, reject) => {
      var db = new database();
      db.setup()
        .then((data) => {
          var sql = `select password from USERS
                        WHERE user_name = ? and status = '${status}'`;
          console.log('Fetch user from DB')
          db._fetchMultipleRows(sql, [user_name])
            .then((data) => {
              if(data.length != 0) {
                //Compare the password from DB with user-input
                if(data[0]['password'] == secret) {
                  //Some FAKE Wait time :)
                  this._sleep(4000)
                      .then(() => {
                        this.response['responseText'] = 'Valid User'
                        resolve(this.response)
                      })
                } else {
                  this.response['responseText'] = 'Invalid password'
                  reject(this.response)
                }
              } else {
                this.response['responseText'] = 'User does not exist or is not yet ACTIVE.'
                reject(this.response)
              }

            })
            .catch((data) => {
              this.response['responseText'] = 'Unable to query Database'
              reject(this.response)
            })
        })
    })
  }

  /**
  * Below function is used to get all users
  *
  **/
  _getAllUsers() {
    return new Promise((resolve, reject) => {
      var db = new database();
      db.setup()
        .then((data) => {
            var sql = `SELECT *
                    FROM USERS`;
            db._fetchMultipleRows(sql, [config_name])
              .then((result) => {
                //DB Query response is a list/array of rows
                this.response['data'] = result
                resolve(this.response)
              })
              .catch((result) => {
                reject(this.response)
              })
        })
    })

  }

  _manageUser(id, operation) {
    //console.log(operation)
    return new Promise((resolve, reject) => {
      var searchForStatus = ''
      var futureStatus = ''
      var db = new database();
      db.setup()
        .then((data) => {
          if (operation == 'activate') {
            searchForStatus = 'INACTIVE'
            futureStatus = 'ACTIVE'
          } else if (operation == 'deactivate') {
            searchForStatus = 'ACTIVE'
            futureStatus = 'INACTIVE'
          }

          var sql = `select status from USERS
                        WHERE id = ? and status =  '${searchForStatus}'`;
          db._fetchMultipleRows(sql, [id])
            .then((data) => {
              if(data.length == 1) {
                var sql = `UPDATE USERS
                            SET status = '${futureStatus}'
                            WHERE id = ?`;
              //  console.log(sql)
                db._updateTable(sql, [id])
                  .then((result) => {
                    //Some FAKE Wait time :)
                    this._sleep(3000)
                        .then(() => {
                          this.response['responseText'] = 'User Activated'
                          resolve(this.response)
                        })
                  })

              } else {
                this.response['responseText'] = 'User does not exist or is already ACTIVE.'
                reject(this.response)
              }

            })
            .catch((data) => {
              this.response['responseText'] = 'Unable to query Database'
              reject(this.response)
            })
        })
    })
  }

}

module.exports = user
