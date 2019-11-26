const sendmail = require('sendmail')();




  var html = 'Plain Text';

  sendmail({
      from: 'scheduler@apps.com',
      to: 'vbhat@akamai.com',
      subject: 'Activation Schedule',
      html: html,
    }, function(err, reply) {
      console.log(err && err.stack);
      console.dir(reply);
  });
