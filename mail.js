var emailContent = require('./static/emailContent.js')
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
      //Construct submitter email body
      console.log('Send email to reviewer')
      emailBody = new emailContent()._constructBody('reviewer',job_id)
      console.log(emailBody)
      console.log('Send email to reviewer')
      this._sendEmail('apps@akamai.com',
                      schedulerObj.reviewer_email,
                      'Activation',
                      emailBody)
      //Construct reviewer email body
      console.log('Send email to submitter')
      emailBody = new emailContent()._constructBody('submitter')
      console.log(emailBody)
      this._sendEmail('apps@akamai.com',
                      schedulerObj.submitter_email,
                      'Activation',
                      emailBody)
      resolve('Email sent successfully')

    })
  }

}

module.exports = mail
