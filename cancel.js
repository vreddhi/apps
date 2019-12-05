const path = require('path');
const sqlite3 = require('sqlite3');

module.exports = function(app){


app.post('/cancelschedule', (req, res) => {
      console.log('here5');


  const dbPath = path.resolve(__dirname, 'apps.db')
  let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the APPS SQlite database.');
  });

    var sql = `UPDATE ALL_ACTIVATIONS
              SET status = 'N'
              WHERE job_id = ?`;
   console.log(schedule_id);          
  db.run(sql, [schedule_id], (err, success) => {
    if (err) {
      console.log(err);
      console.log('The confirmation link is invalid.');
      res.send('Link is Invalid');
    } else {
    res.render('main/cancelscheduleconfirmation', {schedule_id} );
    }

    })  
})

}