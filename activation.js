let EdgeGrid = require('edgegrid');
let untildify = require('untildify');
const path = require('path');
const sqlite3 = require('sqlite3');


class activation {
    //Function to setup EdgeAuth for API requests.
    setup(auth = { path: "~/.edgerc", section: "papi", debug: false, default: true}) {

        if (auth.clientToken && auth.clientSecret && auth.accessToken && auth.host)
            var _edge = new EdgeGrid(auth.clientToken, auth.clientSecret, auth.accessToken, auth.host, auth.debug);
        else
            var _edge = new EdgeGrid({
                path: untildify(auth.path),
                section: auth.section,
                debug: auth.debug
            });

        return(_edge);
    }

    //Function to get a property
    _getProperty(queryObj, _edge, accountSwitchKey) {
      return new Promise((resolve, reject) => {

        let request = {
          method: 'POST',
          path: `/papi/v1/search/find-by-value?accountSwitchKey=${accountSwitchKey}`,
          body: queryObj
        };

         _edge.auth(request);
         _edge.send(function (data, response) {
           if (response && response.statusCode >= 200 && response.statusCode < 400) {
             console.log(response.body);
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
    _activateProperty(propertyLookup, versionId, env = 'STAGING', notes = '', email = ['test@example.com'], acknowledgeWarnings = [], autoAcceptWarnings = true, _edge, accountSwitchKey) {
      return this._getProperty(propertyLookup, _edge, accountSwitchKey)
          .then((data) => {
              //set basic data like contract & group
              const contractId = data.versions.items[0].contractId;
              const groupId = data.versions.items[0].groupId;
              const propertyId = data.versions.items[0].propertyId;
              const propertyName = data.versions.items[0].propertyName;

              console.log(data.versions.items[0].contractId);
              console.log(data.versions.items[0].groupId);
              console.log(data.versions.items[0].propertyId);
              console.log(data.versions.items[0].propertyName);

              return new Promise((resolve, reject) => {
                  console.error(`... activating property (${propertyName}) v${versionId} on ${env}`);

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


                  _edge.auth(request);

                  _edge.send(function (data, response) {
                      if (response.statusCode >= 200 && response.statusCode <= 400) {
                          let parsed = JSON.parse(response.body);
                          resolve(parsed);
                      } else {
                          reject(response.body);
                      }
                  });
              });
          })
          .then(body => {
              if (body.type && body.type.includes('warnings-not-acknowledged')) {
                  let messages = [];
                  console.error('... automatically acknowledging %s warnings!', body.warnings.length);
                  body.warnings.map(warning => {
                      console.error('Warnings: %s', warning.detail);
                      //TODO report these warnings?
                      //console.trace(body.warnings[i]);
                      messages.push(warning.messageId);
                  });
                  //TODO: check that this doesn't happen more than once...
                  return this._activateProperty(propertyLookup, versionId, env, notes, email, messages, autoAcceptWarnings = true, _edge, accountSwitchKey);
              } else
                  //TODO what about errors?
                  return new Promise((resolve, reject) => {
                      //TODO: chaise redirect?
                      let matches = !body.activationLink ? null : body.activationLink.match('activations/([a-z0-9_]+)\\b');

                      if (!matches) {
                          reject(body);
                      } else {
                          resolve(matches[1])
                      }
                  });
          })
          .catch((error) => {
              console.log(error,'\nPromise error');
          });
    }


    _activateProperty_dbcheck(propertyLookup, versionId, env = 'STAGING', notes = '', email = ['test@example.com'], acknowledgeWarnings = [], autoAcceptWarnings = true, _edge, accountSwitchKey, scheduleId) {

        const dbPath = path.resolve(__dirname, 'apps.db')
        let db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
              return console.error(err.message);
            }
            console.log('Connected to the APPS SQlite database.');
          });

        var total_check_sql = `select count(*) as total from ALL_ACTIVATIONS 
                  WHERE job_id = ? and status = "SCHEDULED"`;
        var job_id =  `${scheduleId}`           
        console.log("scheduleId while activating = "+ job_id)            
        db.each(total_check_sql, [job_id], (err, row) => {
        if (err) {
          console.log(err);
          console.log('db execute error.');
          res.send('error');
        } else {
          var total_check_sql_result = row.total  
          if (total_check_sql_result == 1) {
            console.log(" starting activation now")
             let activationResult = this._activateProperty(propertyLookup, versionId, env, notes = 'APPS', email = [reviewer_email, submitter_email, notification_email], acknowledgeWarnings = [], autoAcceptWarnings = true, _edge, accountSwitchKey);

          } else{
            console.log(" cannot start activation as status changed")
          };
        }

        });
    }

}

module.exports = activation
