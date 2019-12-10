const path = require('path');
const sqlite3 = require('sqlite3');

module.exports = function(app){

app.get('/cancelschedule_issueredirect', (req, res) => {
      //console.log('in cancelschedule issue redirect ' + schedule_id);
      var newStr = schedule_id.substring(0, schedule_id.length-1);
      console.log("newStr = "+newStr)
      //res.redirect('http://localhost:3000/cancelschedule?schedule_id=test_4757');         
      res.redirect(302, '/cancelschedule?schedule_id=' + newStr);         

})

}