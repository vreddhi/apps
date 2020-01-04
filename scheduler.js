var Rubidium = require('rubidium');
var validation = require('./validation.js');
var sendEmail = require('./mail.js');
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
  }

  schedule() {
    return new Promise((resolve, reject) => {
      var job_id = Math.floor(Math.random() * 10000).toString();
      var rb = new Rubidium();
      //Setup Database
      var db = new database();
      db.setup()
        .then((data) => {
          console.log('Proceeding to create table')
          db.createTable('ALL_ACTIVATIONS');

          //Initialize a failure response
          var responseText = 'Activation for  ' + this.config_name +' cannot be scheduled due to validation errors.';

          //Validate with data table
          db.fetchRowCount('ALL_ACTIVATIONS', this.config_name, this.config_version, 'PENDING_APPROVAL')
            .then((row_count) => {
              if(row_count == 0) {
                var validation_object = new validation()
                var searchObj = {"propertyName" : this.config_name }
                var _edge = validation_object.setup();
                validation_object._validateProperty(searchObj, this.config_version, _edge, this.account_switch_key)
                                 .then((data) => {
                                    if(data['status'] == true) {
                                      //Proceed further if config is valid
                                      db.insertData(job_id,this.config_name, this.config_version,
                                                    this.actvn_date_time,this.sdpr_link, this.reviewer_email,
                                                    this.submitter_email, this.customer_email,this.notification_email,
                                                    this.account_switch_key, this.actvn_network, 'PENDING_APPROVAL')
                                          .then((insert_result) => {
                                            responseText = 'Config activation for  ' + this.config_name +
                                                        ' will be scheduled subject to Reviewer\'s email approval..';

                                            var confirm_link = "http://localhost:3000/confirm?job_id=" + job_id
                                            resolve(responseText);
                                          })
                                          .catch((insert_result) => {
                                            reject(responseText);
                                          })
                                    }
                                  })
                                  .catch((data) => {
                                    reject(responseText);
                                  })
              } else {
                reject(responseText);
              }
            });

        });
    });

  } //End of schedule function

}

module.exports = scheduler
