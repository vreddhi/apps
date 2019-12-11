let EdgeGrid = require('edgegrid');
let untildify = require('untildify');


class validation {
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

    _getNewProperty(_edge, propertyId, groupId, contractId, accountSwitchKey) {
        return new Promise((resolve, reject) => {

            let request = {
                method: 'GET',
                path: `/papi/v1/properties/${propertyId}?contractId=${contractId}&groupId=${groupId}&accountSwitchKey=${accountSwitchKey}`,
            };

            _edge.auth(request);

            _edge.send(function (data, response) {
                if (response && response.statusCode >= 200 && response.statusCode < 400) {
                    let parsed = JSON.parse(response.body);
                    resolve(parsed);
                } else if (response && response.statusCode == 403) {
                    console.error('... your client credentials have no access to this group, skipping {%s : %s}', contractId, groupId);
                    resolve(null);
                } else {
                    reject(response);
                }
            });
        });
    }

    //Function to get a property
    _searchProperty(queryObj, _edge, accountSwitchKey) {
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
    _validateProperty(propertyLookup, version, _edge, accountSwitchKey) {
      return this._searchProperty(propertyLookup, _edge, accountSwitchKey)
          .then((data) => {
              //set basic data like contract & group
              var status = new Boolean(false)
              var validation_result = {
                "status" : status,
                "reason" : "Unknown",
                "contractId" : "Unknown",
                "groupId" : "Unknown",
                "propertyId" : "Unknown",
                "version": -1
              }

              if(data.versions.items.length == 0) {
                console.log('Given configuration is invalid')
                validation_result['reason'] = "Unable to find configuration"
              } else {
                console.log('Given configuration is valid')
                validation_result['reason'] = "Configuration is valid"
                validation_result['status'] =  new Boolean('true')
                validation_result['contractId'] = data.versions.items[0].contractId;
                validation_result['groupId'] = data.versions.items[0].groupId;
                validation_result['propertyId'] = data.versions.items[0].propertyId;
              }

              return validation_result
          })
          .catch((error) => {
              console.log(error,'\nPromise error');
          });
    }

}

module.exports = validation
