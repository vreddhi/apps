var fs = require('fs');
var search = require('./search.js')
const sendmail = require('sendmail')({
  silent: true
});


class mail {
  /**
  * Below function is used to send email
  * @param : from
  * @param : to
  * @param : subject
  * @param : body
  */
  _sendEmail(from, to, subject, body) {
      console.log('Sending emails')
      sendmail({
          from: from,
          to: to,
          subject: subject,
          html: body,
        }, function(err, reply) {
          if(err){
            console.log('Cannot send email')
          } else {
            console.log('Email Sent Successfully')
          }
      });
  }

  /**
  * Below function is used to construct Email body
  * for submitter and reviewer
  * @param schedulerObj
  * @param job_id
  **/
  _triggerEmails(schedulerObj, job_id='') {
    var emailBody = null
    return new Promise((resolve, reject) => {
      if (schedulerObj.email_context == 'final_notification') {
        searchObj = new search()
        console.log("job_id = "+ job_id);
        searchObj._findScheduleByJobId(job_id)
        .then((result) => {
          var dataRows = result['queryResult']
          console.log("dataRows status = "+ dataRows[0].status);
          if (dataRows[0].status == 'SCHEDULED') {
            //Construct reviwer email body
            this._getContent('reviewer', schedulerObj, job_id)
                .then((emailBody) => {
                  console.log('Send email to reviewer')
                  this._sendEmail('apps@akamai.com',
                                  schedulerObj.reviewer_email,
                                  'Activation',
                                  emailBody)
                })
            //Construct submitter email body
            this._getContent('submitter', schedulerObj, job_id)
                .then((emailBody) => {
                  console.log('Send email to submitter')
                  this._sendEmail('apps@akamai.com',
                                  schedulerObj.submitter_email,
                                  'Activation',
                                  emailBody)
                })
          }
        })
      }else{
        //Construct reviwer email body
        this._getContent('reviewer', schedulerObj, job_id)
            .then((emailBody) => {
              console.log('Send email to reviewer')
              this._sendEmail('apps@akamai.com',
                              schedulerObj.reviewer_email,
                              'Activation',
                              emailBody)
            })

        //Construct submitter email body
        this._getContent('submitter', schedulerObj, job_id)
            .then((emailBody) => {
              console.log('Send email to submitter')
              this._sendEmail('apps@akamai.com',
                              schedulerObj.submitter_email,
                              'Activation',
                              emailBody)
            })
        }
      resolve('Email sent successfully')

    })
  }

  /**
  * Below function is used to construct Email body
  * @param : toWhom
  * @param : schedulerObj
  * @param : job_id
  **/
  _getContent(toWhom, schedulerObj, job_id) {
    return new Promise((resolve,reject) => {
      var contents = ''
      fs.readFile('./static/emailContent.html', 'utf8', function(err, contents) {
        contents = contents.replace('{{Configuration Name}}',schedulerObj.config_name)
        contents = contents.replace('{{Configuration Version}}',schedulerObj.config_version)
        contents = contents.replace('{{Activation Date and Time}}',schedulerObj.actvn_date_time)
        contents = contents.replace('{{SPDR Link}}',schedulerObj.sdpr_link)
        contents = contents.replace('{{Reviewer Email}}',schedulerObj.reviewer_email)
        contents = contents.replace('{{Submitter Email}}',schedulerObj.submitter_email)
        contents = contents.replace('{{Customer Email}}',schedulerObj.customer_email)
        contents = contents.replace('{{Notification Email}}',schedulerObj.notification_email)
        var main_email_message_2 = 'Below are the details of configuration that will be scheduled to activate.'
        if (schedulerObj.email_context == 'confirm_notification') {
          var main_email_message_1 = 'The below schedule has been approved by reviewer.'
          main_email_message_2 = ''
          var tex_to_replace = ''
        }else if (schedulerObj.email_context == 'cancel_notification') {
          var main_email_message_1 = 'The below schedule has been cancelled by submitter.'
          main_email_message_2 = ''
          var tex_to_replace = ''
        }
        else if (schedulerObj.email_context == 'final_notification') {
          var main_email_message_1 = 'Activation for below schedule will start in 30 minutes.'
          main_email_message_2 = ''
          var tex_to_replace = ''
        }else {
          if(toWhom == 'reviewer') {
            var main_email_message_1 = 'Here are the details of Activation Scheduled awaiting your approval'
            var tex_to_replace = '<p>Click the below Confirmation link to schedule the Activation.</p>' +
                                 'http://localhost:3000/confirm?job_id=' + job_id
          }
          if(toWhom == 'submitter') {
            var main_email_message_1 = 'Here are the details of Activation Scheduled for you'
            var tex_to_replace = '<p>You can reach out to reviewer </p>' + schedulerObj.reviewer_email +
                                 ' to confirm the activation scheduling. Only reviewer can schedule this.'
          }
        }
        contents = contents.replace('{{Main message}}',main_email_message_1)
        contents = contents.replace('{{Sub message}}',main_email_message_2)
        contents = contents.replace('{{confirm_link}}',tex_to_replace)
        resolve(contents)
      });
    })
  }

  /**
  * Below function is used to construct Email body
  * @param : user_name - User email of account creator
  * @param : server URL to manage users
  **/
  _getUserApprovalContent(user_name, app_location) {
    return new Promise((resolve,reject) => {
      var contents = ''
      fs.readFile('./static/userApprovalContent.html', 'utf8', function(err, contents) {
          contents = contents.replace('{{User Name}}',user_name)
          contents = contents.replace('{{Approval}}',app_location)
          resolve(contents)
      })
    })
  }

  /**
  * Below function is used to construct Email body for approved user
  * @param : user_name - User email of account owner
  * @param : operation - Either activate or deactivate
  **/
  _getUserUpdateContent(user_name, operation) {
    console.log(operation)
    return new Promise((resolve,reject) => {
      fs.readFile('./static/userApprovedContent.html', 'utf8', function(err, contents) {
          contents = contents.replace('{{User Name}}',user_name)
          if(operation == 'activate') {
            contents = contents.replace('{{message}}','Your user account has been approved.')
          } else {
            contents = contents.replace('{{message}}','Your user account has been de-activated/deleted.')
          }
          resolve(contents)
      })
    })
  }

}

module.exports = mail
