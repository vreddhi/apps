var fs = require('fs');

const sendmail = require('sendmail')({
  silent: true
});


class mail {
  /*
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

  /*
  * Below function is used to construct Email body
  * @param : from
  * @param : to
  * @param : subject
  * @param : body
  */
  _triggerEmails(schedulerObj, job_id='') {
    var emailBody = null
    return new Promise((resolve, reject) => {
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
      resolve('Email sent successfully')

    })
  }

  /*
  * Below function is used to construct Email body
  * @param : from
  * @param : to
  * @param : subject
  * @param : body
  */
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
        if(toWhom == 'reviewer') {
          var tex_to_replace = '<p>Click the below Confirmation link to schedule the Activation.</p>' +
                               'https://localhost:3000/?job_id=' + job_id
          contents = contents.replace('{{confirm_link}}',tex_to_replace)
        } else {
          var tex_to_replace = '<p>You can reach out to reviewer</p>' + schedulerObj.reviewer_email +
                               ' to confirm the activation scheduling. Only reviewer can schedule this.'
          contents = contents.replace('{{confirm_link}}',tex_to_replace)
        }
        resolve(contents)
      });
    })
  }


}

module.exports = mail
