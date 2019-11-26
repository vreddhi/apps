var Rubidium = require('rubidium');

var rb = new Rubidium();

rb.on('job', job => {

  
  console.log(job.message)

});


rb.add({ time: Date.now() + 5000, message: 'Sent emails' });
