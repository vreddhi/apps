let EdgeGrid = require('edgegrid');
let untildify = require('untildify');
const path = require('path');
const sqlite3 = require('sqlite3');


class activation {
    /**
    * Below function is used to initilize an API connection variable
    **/
    constructor() {
      this._connection = null
    }

    /**
    * Below function is used to initilize an API connection to backend
    * @param : path
    * @param : section
    * @param : debug
    **/
    _setup(auth = { path: "~/.edgerc", section: "papi", debug: false, default: true}) {
      return new Promise((resolve, reject) => {
        if (auth.clientToken && auth.clientSecret && auth.accessToken && auth.host) {
          this._connection = new EdgeGrid(auth.clientToken, auth.clientSecret, auth.accessToken, auth.host, auth.debug);
        } else {
          this._connection = new EdgeGrid({
              path: untildify(auth.path),
              section: auth.section,
              debug: auth.debug
          });
        }
        resolve(this._connection)
      })

    }

    /**
    * Below function is used to get details of property
    * @param : queryObj
    * @param : accountSwitchKey
    **/
    _getProperty(queryObj, accountSwitchKey) {
      return new Promise((resolve, reject) => {

        let request = {
          method: 'POST',
          path: `/papi/v1/search/find-by-value?accountSwitchKey=${accountSwitchKey}`,
          body: queryObj
        };

         this._connection.auth(request);
         this._connection.send(function (data, response) {
           if (response && response.statusCode >= 200 && response.statusCode < 400) {
             let parsed = JSON.parse(response.body);
             resolve(parsed);
           } else {
             reject(response);
           }
         })
      })
    }

    /**
    * This code is from CLI Property
    * Internal function to activate a property
    *
    * @param propertyLookup
    * @param versionId
    * @param env
    * @param notes
    * @param email
    * @param acknowledgeWarnings
    * @param autoAcceptWarnings
    * @returns {Promise.<TResult>}
    * @private
    */
    _activateProperty(contractId, groupId, propertyId, versionId, env,
                      notes, email, acknowledgeWarnings = [],
                      autoAcceptWarnings = true, accountSwitchKey) {
      return new Promise((resolve, reject) => {
          let activationData = {
              propertyVersion: versionId,
              network: env,
              note: notes,
              notifyEmails: email,
              acknowledgeWarnings: acknowledgeWarnings,
              complianceRecord: {
                  noncomplianceReason: 'NO_PRODUCTION_TRAFFIC'
              }
          };

          let request = {
              method: 'POST',
              path: `/papi/v1/properties/${propertyId}/activations?contractId=${contractId}&groupId=${groupId}&accountSwitchKey=${accountSwitchKey}`,
              body: activationData
          };

          this._connection.auth(request);
          this._connection.send((data, response) => {
            if (response.statusCode >= 200 && response.statusCode <= 400) {
                let parsed = JSON.parse(response.body);
                resolve(parsed);
            } else {
                reject(response.body);
            }
         })
       })
    }

    /**
    * Below function is used to check DB and activate configuration
    * @param : db
    * @param : queryObj
    * @param : versionId
    * @param : env
    * @param : notes
    * @param : email
    * @param : acknowledgeWarnings
    * @param : autoAcceptWarnings
    * @param : accountSwitchKey
    * @param : job_id
    **/
    _finalActivation(db, queryObj, versionId, env , notes, email,
                     acknowledgeWarnings = [], autoAcceptWarnings = true, accountSwitchKey, job_id) {
        return new Promise((resolve, reject) => {
          var total_check_sql = `select count(*) as total from ALL_ACTIVATIONS
                    WHERE job_id = ? and status = "SCHEDULED"`;
          console.log("scheduleId while activating = "+ job_id)
          db._execute(total_check_sql, [job_id])
            .then((result) => {
                if (result.total == 1) {
                    this._getProperty(queryObj, accountSwitchKey)
                          .then((body) => {
                            console.log(body.versions.items[0])
                            let contractId = body.versions.items[0].contractId
                            let groupId = body.versions.items[0].groupId
                            let propertyId = body.versions.items[0].propertyId
                            this._activateProperty(contractId, groupId, propertyId,
                                                      versionId,
                                                      env,
                                                      notes,
                                                      email,
                                                      acknowledgeWarnings = [],
                                                      autoAcceptWarnings = true,
                                                      accountSwitchKey)
                                  .then((body) => {
                                      //let body = JSON.parse(response.body);
                                      console.log(body)
                                      let messages = [];
                                      if (body.type && body.type.includes('warnings-not-acknowledged')) {
                                          console.error('... automatically acknowledging %s warnings!', body.warnings.length);
                                          body.warnings.map(warning => {
                                              messages.push(warning.messageId);
                                          });
                                      }
                                      //TODO: check that this doesn't happen more than once...
                                      console.log(contractId)
                                      console.log(groupId)
                                      console.log(propertyId)
                                      this._activateProperty(contractId, groupId, propertyId,
                                                        versionId, env, notes, email,
                                                        messages, autoAcceptWarnings = true,
                                                        accountSwitchKey)
                                          .then((result) => {
                                            //If activation is success, update the DB as completed
                                            var sql = `UPDATE ALL_ACTIVATIONS
                                                        SET status = 'IN_PROGRESS'
                                                        WHERE job_id = ?`;
                                            db._updateTable(sql, [job_id])
                                              .then((result) => {
                                                //Success activating and DB update
                                                console.log('Successfully activing')
                                                resolve('Successfully activing')
                                              })
                                              .catch((result) => {
                                                //Success activating and Failure to DB update
                                                console.log('FAIL: Unable to update database as COMPLETED')
                                                var sql = `UPDATE ALL_ACTIVATIONS
                                                          SET status = 'FAILED'
                                                          WHERE job_id = ?`;
                                                db._updateTable(sql, [job_id])
                                                reject('Failure')
                                              })
                                          })
                                          .catch((body) => {
                                            console.log('FAIL: Unable to acknowledge warnings')
                                            var sql = `UPDATE ALL_ACTIVATIONS
                                                      SET status = 'FAILED'
                                                      WHERE job_id = ?`;
                                            db._updateTable(sql, [job_id])
                                            reject(body)
                                          })
                                  })
                                  .catch((body) => {
                                    console.log('FAIL: Unable to issue activation request')
                                    var sql = `UPDATE ALL_ACTIVATIONS
                                              SET status = 'FAILED'
                                              WHERE job_id = ?`;
                                    db._updateTable(sql, [job_id])
                                    reject(body)
                                  })
                          })
                          .catch((body) => {
                            console.log('FAIL: Unable to find property')
                            var sql = `UPDATE ALL_ACTIVATIONS
                                      SET status = 'FAILED'
                                      WHERE job_id = ?`;
                            db._updateTable(sql, [job_id])
                            reject(body)
                          })
                } else {
                  //Nothing to activate as per database
                  reject('Nothin to activate as per data table')
                };

            })
            .catch((result) => {
              console.log('db execute error.');
              reject('Unable to query DB to get configuration details');
            })

        })
    }

}

module.exports = activation
