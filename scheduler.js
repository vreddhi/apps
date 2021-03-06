var activation = require('./activation.js');
var database = require('./database.js')

class scheduler {
  /*
  * Below function is used to instantiate the values of request
  * Contructor is used for this task
  */
  constructor(req) {
    this.config_name = req.body['config_name']
    this.config_version = req.body['config_version']
    this.actvn_date_time = req.body['actvn_date_time']
    this.actvn_network = req.body['actvn_network']
    this.sdpr_link = req.body['sdpr_link']
    this.reviewer_email = req.body['reviewer_email']
    this.submitter_email = req.body['submitter_email']
    this.customer_email = req.body['customer_email']
    this.notification_email = req.body['notification_email']
    this.account_switch_key = req.body['account_switch_key']
    console.log(this)
    //Initialize a negative result, we will over-ride for success case
    this.result = {
      "responseText" : 'FATAL: Generic Error',
      "job_id" : "Unknown"
    }
  }

  schedule() {
    return new Promise((resolve, reject) => {
      var job_id = Math.floor(Math.random() * 10000).toString();
      //Setup Database
      var db = new database();
      db.setup()
        .then((data) => {
          console.log('Proceeding to create table')
          db.createTable('ALL_ACTIVATIONS');

          //Validate with data table
          db.fetchRowCount('ALL_ACTIVATIONS', this.config_name, this.config_version, 'SCHEDULED')
            .then((row_count) => {
              if(row_count == 0) {
                var searchObj = {"propertyName" : this.config_name }
                var actObj = new activation()
                actObj._setup()
                      .then((data) => {
                        actObj._getProperty(searchObj, this.account_switch_key)
                              .then((body) => {
                                let contractId = body.versions.items[0].contractId
                                let groupId = body.versions.items[0].groupId
                                let propertyId = body.versions.items[0].propertyId
                                actObj._getPropertyDetails(propertyId, groupId, contractId, this.account_switch_key)
                                      .then((data) => {
                                        if(data.properties.items[0].latestVersion < this.version) {
                                          console.log('Given version is greater than available version in ACC.')
                                          this.result['responseText'] = 'Given version is greater than available version in ACC.'
                                          reject(this.result)

                                        } else {

                                           db.insertData(job_id,this.config_name,
                                                                this.config_version,
                                                                this.actvn_date_time,
                                                                this.sdpr_link,
                                                                this.reviewer_email,
                                                                this.submitter_email,
                                                                this.customer_email,
                                                                this.notification_email,
                                                                this.account_switch_key,
                                                                this.actvn_network,
                                                                'PENDING_APPROVAL')
                                               .then((insert_result) => {
                                                 this.result['responseText'] = 'Config activation for  ' + this.config_name +
                                                             ' will be scheduled approval from ' + this.reviewer_email;
                                                 this.result['job_id'] = job_id
                                                 resolve(this.result);
                                               })
                                               .catch((insert_result) => {
                                                 reject(this.result);
                                               })

                                        }
                                      })
                                      .catch((data) => {
                                        console.log('Unable to get version details of configuration.')
                                        this.result['responseText'] = 'Unable to get version details of configuration'
                                        reject(this.result)
                                      })
                              })
                              .catch((data) => {
                                console.log('Unable to get details of configuration.')
                                this.result['responseText'] = 'Unable to find the given configuration.'
                                reject(this.result)
                              })
                      })
                      .catch((data) => {
                        console.log('Unable to make API calls.')
                        this.result['responseText'] = 'Unable to make API calls.'
                        reject(this.result)
                      })

              } else {

                this.result['responseText'] = 'Activation for  ' + this.config_name +' cannot be scheduled' +
                                              ' as there is already one scheduled';
                reject(this.result);
              }
            })
            .catch((data) => {
              this.result['responseText'] = 'Activation for  ' + this.config_name +' cannot be scheduled' +
                                            ' as there was a database error';
              reject(this.result);
            })

        })
        .catch((data) => {
          this.result['responseText'] = 'Activation for  ' + this.config_name +' cannot be scheduled' +
                                        'as connection to DB Failed';
          reject(this.result);
        })
    })

  } //End of schedule function


}

module.exports = scheduler
