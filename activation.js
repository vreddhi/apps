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
    * Function is used to initilize an API connection to backend
    * @param {string} path - Path of Edgerc File
    * @param {string} section - Section within edgerc file
    * @param {string} debug - log mode
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
    * Function is used to get details of property
    * It sends a POST request to search property and
    * returns a Parsed response as Promise Object
    * @param {string} queryObj - property to search for represented in JSON
    * @param {string} accountSwitchKey - SwithcKey to search property
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
             if(parsed.versions.items.length > 0) {
               resolve(parsed);
             } else {
               reject(parsed)
             }

           } else {
             reject(response);
           }
         })
      })
    }

    /**
    * Function is used to get details of property
    * It sends a GET request to get details of property
    * returns a Parsed response as Promise Object
    * @param {string} propertyId - propetyId of configuration
    * @param {string} groupId - groupId of configuration
    * @param {string} contractId - contractId of configuration
    * @param {string} accountSwitchKey - SwithcKey to search property
    **/
    _getPropertyDetails(propertyId, groupId, contractId, accountSwitchKey) {
        return new Promise((resolve, reject) => {

            let request = {
                method: 'GET',
                path: `/papi/v1/properties/${propertyId}?contractId=${contractId}&groupId=${groupId}&accountSwitchKey=${accountSwitchKey}`,
            };

            this._connection.auth(request);

            this._connection.send(function (data, response) {
                if (response && response.statusCode >= 200 && response.statusCode < 400) {
                    let parsed = JSON.parse(response.body);
                    resolve(parsed);
                } else {
                    reject(response);
                }
            });
        });
    }

    /**
    * This is sleep function
    * @param time
    * @returns {Promise.<TResult>}
    */
    _sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    /**
    * This code is from CLI Property
    * Internal function to poll activation
    * @param {string} propertyId - propetyId of configuration
    * @param {string} groupId - groupId of configuration
    * @param {string} contractId - contractId of configuration
    * @param {string} activationID - SwithcKey to search property
    * @param {string} accountSwitchKey - SwithcKey to search property
    * @returns {Promise.<TResult>}
    */
    _pollActivation(contractId, groupId, propertyId, activationID, accountSwitchKey) {
        return new Promise((resolve, reject) => {
              let request = {
                  method: 'GET',
                  path: `/papi/v1/properties/${propertyId}/activations/${activationID}?contractId=${contractId}&groupId=${groupId}&accountSwitchKey=${accountSwitchKey}`,
              };

              this._connection.auth(request);
              this._connection.send(function (data, response) {
                  if (response.statusCode === 200 && /application\/json/.test(response.headers['content-type'])) {
                      let parsed = JSON.parse(response.body);
                      resolve(parsed);
                  }
                  if (response.statusCode === 500) {
                      console.error('Activation caused a 500 response. Retrying...')
                      resolve({
                          activations: {
                              items: [{
                                  status: 'PENDING'
                              }]
                          }
                      });
                  } else {
                      reject(response);
                  }
              })
            })
            .then((data) => {
                let pending = false;
                let active = false;
                data.activations.items.map(status => {
                    pending = pending || 'ACTIVE' != status.status;
                    active = !pending && 'ACTIVE' === status.status;
                });
                if (pending) {
                    console.error('... waiting 30s');
                    return this._sleep(30000).then(() => {
                        return this._pollActivation(contractId, groupId, propertyId, activationID, accountSwitchKey);
                    });
                } else {
                    //Finally return TRUE or FALSE
                    return active ? Promise.resolve(true) : Promise.reject(data);
                }

            });
    }

    /**
    * This code is from CLI Property
    * Internal function to activate a property
    *
    * @param {string} propertyId - propetyId of configuration
    * @param {string} groupId - groupId of configuration
    * @param {string} contractId - contractId of configuration
    * @param {string} accountSwitchKey - SwithcKey to search property
    * @param {string} versionId - version numner
    * @param {string} env - STAGING or PRODUCTION
    * @param {string} notes - Activation Notes
    * @param {string} email - Notification emails
    * @param {string} acknowledgeWarnings - Warnings of configuration
    * @param {string} autoAcceptWarnings - Ack warnings generated
    * @returns {Promise.<TResult>}
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
          //console.log('Sending POST')
          let request = {
              method: 'POST',
              path: `/papi/v1/properties/${propertyId}/activations?contractId=${contractId}&groupId=${groupId}&accountSwitchKey=${accountSwitchKey}`,
              body: activationData
          };

          this._connection.auth(request);
          this._connection.send((data, response) => {
            //console.log(response.body)
            if (response.statusCode >= 200 && response.statusCode <= 400) {
                let parsed = JSON.parse(response.body);
                //resolve(parsed);
                //console.log(parsed)
                let messages = [];
                if (parsed.type && parsed.type.includes('warnings-not-acknowledged')) {
                    console.error('... automatically acknowledging %s warnings!', parsed.warnings.length);
                    parsed.warnings.map(warning => {
                        messages.push(warning.messageId);
                    });
                    this._activateProperty(contractId, groupId, propertyId,
                                      versionId, env, notes, email,
                                      messages, autoAcceptWarnings = true,
                                      accountSwitchKey)
                        .then((data) => {
                          //This is needed as it is a recursive call
                          console.log('Resolving from recursive call')
                          console.log(data)
                          resolve(data)
                        })
                        .catch((data) => {
                          //This is needed as it is a recursive call
                          console.log('Rejecting from recursive call')
                          console.log(data)
                          reject(data)
                        })
                } else {
                      //TODO: chaise redirect?
                      let matches = !parsed.activationLink ? null : parsed.activationLink.match('activations/([a-z0-9_]+)\\b');

                      if (!matches) {
                          console.log('Rejecting from matches')
                          console.log(parsed)
                          reject(parsed);
                      } else {
                          //console.log(matches[1])
                          console.log('Resolving from recursive call')
                          console.log(matches[1])
                          resolve(matches[1])
                      }
                }
            } else {
                console.log('Rejecting from activation call')
                console.log(response.body)
                reject(response.body);
            }
         })
       })

    }

    /**
    * Below function is used to check DB and activate configuration
    * @param db
    * @param {string} queryObj - JSON representation of property to be searched for
    * @param {string} versionId - version numner
    * @param {string} env - STAGING or PRODUCTION
    * @param {string} notes - Activation Notes
    * @param {string} email - Notification emails
    * @param {string} acknowledgeWarnings - Warnings of configuration
    * @param {string} autoAcceptWarnings - Ack warnings generated
    * @param {string} accountSwitchKey - SwithcKey to search property
    * @param job_id
    **/
    _finalActivation(db, queryObj, versionId, env , notes, email,
                     acknowledgeWarnings = [], autoAcceptWarnings = true, accountSwitchKey, job_id) {
        return new Promise((resolve, reject) => {
          var total_check_sql = `select count(*) as total from ALL_ACTIVATIONS
                    WHERE job_id = ? and status = "SCHEDULED"`;
          console.log("scheduleId while activating = "+ job_id)
          db._execute(total_check_sql, [job_id])
            .then((result) => {
                //Proceed further only if DB query resulted in 1 row
                if (result.total == 1) {
                    this._getProperty(queryObj, accountSwitchKey)
                          .then((body) => {
                            //console.log(body.versions.items[0])
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
                                  .then((activationID) => {
                                      console.log('Activation issued Successfully')
                                      //Asynchronously update Database
                                      var sql = `UPDATE ALL_ACTIVATIONS
                                                  SET status = 'IN_PROGRESS'
                                                  WHERE job_id = ?`;
                                      db._updateTable(sql, [job_id])

                                      //Asynchronously poll activation
                                      this._pollActivation(contractId, groupId, propertyId, activationID, accountSwitchKey)
                                            .then((result) => {
                                              console.log('Polling Activation Successfully Finished')
                                              console.log(result)
                                              //Asynchronously update Database
                                              var sql = `UPDATE ALL_ACTIVATIONS
                                                          SET status = 'COMPLETED'
                                                          WHERE job_id = ?`;
                                              db._updateTable(sql, [job_id])
                                              resolve('Success')
                                            })
                                            .catch((result) => {
                                              console.log('Failure to poll Activation')
                                              console.log(result)
                                              //Asynchronously update Database
                                              var sql = `UPDATE ALL_ACTIVATIONS
                                                          SET status = 'UNKNOWN'
                                                          WHERE job_id = ?`;
                                              db._updateTable(sql, [job_id])
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
