let EdgeGrid = require('edgegrid');
let untildify = require('untildify');


module.exports = function(app){
  app.get('/confirm', (req,res) => {
    //Function to setup EdgeAuth for API requests.
    function setup(auth = { path: "~/.edgerc", section: "papi", debug: false, default: true}) {

        if (auth.clientToken && auth.clientSecret && auth.accessToken && auth.host)
            _edge = new EdgeGrid(auth.clientToken, auth.clientSecret, auth.accessToken, auth.host, auth.debug);
        else
            _edge = new EdgeGrid({
                path: untildify(auth.path),
                section: auth.section,
                debug: auth.debug
            });

        return(_edge);
    }

    //Function to get a property
    function _getProperty(queryObj, _edge, accountSwitchKey) {
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
    function _activateProperty(propertyLookup, versionId, env = 'STAGING', notes = '', email = ['test@example.com'], acknowledgeWarnings = [], autoAcceptWarnings = true, _edge, accountSwitchKey) {
      return _getProperty(propertyLookup, _edge, accountSwitchKey)
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
                  return _activateProperty(propertyLookup, versionId, env, notes, email, messages, autoAcceptWarnings = true, _edge, accountSwitchKey);
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

    config_name_1 = req.body['config_name_1']
    versionId = req.body['config_version_1']
    env = req.body['actvn_network']
    reviewer_email = req.body['reviewer_email']
    submitter_email = req.body['submitter_email']
    customer_email = req.body['customer_email']
    notification_email = req.body['notification_email']
    accountSwitchKey = req.body['account_switch_key']

    _edge = setup();
    let searchObj = {"propertyName" : config_name_1 }
    //invoke Activation
    activationResult = _activateProperty(searchObj, versionId, env, notes = '', email = [reviewer_email, submitter_email, notification_email], acknowledgeWarnings = [], autoAcceptWarnings = true, _edge, accountSwitchKey);

  }
}
