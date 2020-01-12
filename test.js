var activation = require('./activation.js')
var database = require('./database.js')


var actObj = new activation();

let queryObj = {"propertyName" : 'www.vbhat.com' }
let accountSwitchKey = '1-5C0YLB'
let versionId = '54'
let env = 'STAGING'
let email = ['vbhat@akamai.com']
let notes = ''


var db = new database();
db.setup()
  .then((data) => {
    actObj._getProperty(queryObj, accountSwitchKey)
          .then((body) => {
            contractId = body.versions.items[0].contractId
            groupId = body.versions.items[0].groupId
            propertyId = body.versions.items[0].propertyId
            actObj._activateProperty(contractId, groupId, propertyId,
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
                      if (body.type && body.type.includes('warnings-not-acknowledged')) {
                          let messages = [];
                          console.error('... automatically acknowledging %s warnings!', body.warnings.length);
                          body.warnings.map(warning => {
                              messages.push(warning.messageId);
                          });
                          //TODO: check that this doesn't happen more than once...
                          actObj._activateProperty(contractId, groupId, propertyId,
                                            versionId, env, notes, email,
                                            messages, autoAcceptWarnings = true,
                                            accountSwitchKey)
                              .then((result) => {
                                //If activation is success, update the DB as completed
                                var sql = `UPDATE ALL_ACTIVATIONS
                                            SET status = 'COMPLETED'
                                            WHERE job_id = ?`;
                                db._execute(sql, [req.query.job_id])
                                  .then((result) => {
                                    //Success activating and DB update
                                    console.log('Success')
                                  })
                                  .catch((result) => {
                                    //Success activating and Failure to DB update
                                    console.log('FAIL: Unable to update database as COMPLETED')
                                    console.log('Failure')
                                  })
                              })
                              .catch((body) => {
                                console.log('FAIL: Unable to acknowledge warnings')
                                console.log(body)
                              })
                      }
                  })
                  .catch((body) => {
                    console.log('FAIL: Unable to issue activation request')
                    console.log(body)
                  })
          })
          .catch((body) => {
            console.log('FAIL: Unable to find property')
            console.log(body)
          })
    })
