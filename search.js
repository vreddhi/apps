const path = require('path');
const sqlite3 = require('sqlite3');

module.exports = function(app){


app.post('/search', (req, res) => {
  //console.log(res.body)

  const dbPath = path.resolve(__dirname, 'apps.db')
  let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the APPS SQlite database.');
  });

 


  if (schedule_id) {
      var sql = `SELECT *
              FROM ALL_ACTIVATIONS
              WHERE job_id = ? `;

      db.each(sql, [schedule_id], (err, row) => {
        if (err) {
          console.log(err);
          console.log('unable to fecth data from table.');
        } else {
          var config_name_1 = row.config_name
          var config_version_1 = row.version
          var actvn_date_time = row.date
          var schedule_id = row.job_id
          schedule_found = "yes";
          console.log("schedule found in 1 = "+ schedule_found)
          res.render('main/searchresult', { config_name_1, config_version_1,actvn_date_time, schedule_id });
         }
       })

  };
    if (config_name) {
                          console.log(" here1");

    var sql = `SELECT *
              FROM ALL_ACTIVATIONS
              WHERE config_name = ? `;

      db.each(sql, [config_name], (err, row) => {
                                  console.log(" here2");

        if (err) {
          console.log(err);
          console.log('unable to fecth data from table.');
        } else {
                    console.log(" here3");

          var config_name_1 = row.config_name
          var config_version_1 = row.version
          var actvn_date_time = row.date
          var schedule_id = row.job_id
          schedule_found = "yes";
                    console.log("schedule found in 2 = "+ schedule_found)

          res.render('main/searchresult', { config_name_1, config_version_1,actvn_date_time, schedule_id });
         }
       })
   

 };




})

}
