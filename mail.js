const sendmail = require('sendmail')({
  silent: true
});

class sendEmail {
  /*
  * Below function is used to send email
  * @param : html
  */
  constructor(from, to, subject, body) {
    sendmail({
        from: from,
        to: to,
        subject: subject,
        html: body,
      }, function(err, reply) {
        console.log(err && err.stack);
        console.dir(reply);
    });
  }

}

module.exports = sendEmail
