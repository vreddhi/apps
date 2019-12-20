const path = require('path');
const sqlite3 = require('sqlite3');

module.exports = function(app){


app.get('/cancelschedule', (req, res) => {
      console.log('in cancelschedule.js');


  const dbPath = path.resolve(__dirname, 'apps.db')
  let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the APPS SQlite database.');
  });

    var sql = `UPDATE ALL_ACTIVATIONS
              SET status = 'CANCELLED'
              WHERE job_id = ?`;
   console.log("schedule_id = " + schedule_id);          
  db.run(sql, [schedule_id], (err, success) => {
    if (err) {
      console.log(err);
      console.log('The confirmation link is invalid.');
      res.send('error');
    } else {
      res.send("success")
  
    }

    });  
});

}