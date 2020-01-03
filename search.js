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
      var sql = `SELECT *, count(*) as total
              FROM ALL_ACTIVATIONS
              WHERE job_id = ? `;

      db.each(sql, [schedule_id], (err, row) => {
        if (err) {
          console.log(err);
          console.log('unable to fecth data from table.');
        } else {
          //console.log("row count = "  +row.total);
          if (row.total == 0) {
               var config_name_1 = "No schedules found"
               res.render('main/searchresult_nodata', {config_name_1});
          } else{

               var config_name_1 = row.config_name
               var config_version_1 = row.version
               var actvn_date_time = row.date
               var schedule_id = row.job_id
               var schedule_status = row.status
               if (schedule_status != "SCHEDULED") {
                 res.render('main/searchresult_nodata' , { config_name_1, config_version_1,actvn_date_time, schedule_id, schedule_status});
               } else{

                 res.render('main/searchresult', { config_name_1, config_version_1,actvn_date_time, schedule_id, schedule_status});
               };

          };
         }
       })
   };

      if (config_name) {
      var sql = `SELECT * 
              FROM ALL_ACTIVATIONS
              WHERE config_name = ? `;
        var data=[],records=[];

        function getRecords(){
            return new Promise(resolve=>{
                db.all(sql,[config_name],(err,rows)=>{
                    if(err){
                        return console.error(err.message);
                    }
                    rows.forEach((row)=>{
                        data.push(row);
                    });

                    resolve(data);
                });
            });
        }
        async function asyncCall(){
            records=await getRecords();

            console.log(data)
            var arrayLength = data.length;
            if (arrayLength != 0) {
                for (var i = 0; i < arrayLength; i++) {
                if (data[i].status != "PENDING_APPROVAL" && data[i].status != "SCHEDULED") {
                  data[i].submit_status = "disabled";
                  //console.log(data);
                };                
              }
            } else {
              data.push({"config_name": "No schedules found", "submit_status": "disabled"})
            }
          data = data.reverse();  
          res.render('main/searchresult', { data });
        }

        asyncCall();
   }
});

}