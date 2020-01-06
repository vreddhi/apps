class emailContent {

  _constructBody(bodyType='',job_id='') {
    console.log(bodyType)
    console.log(job_id)
    //Setup the right email body to reviewer and submitter
    var customContent = '<p></p>'
    var confirm_link = ''
    if(bodyType == 'reviewer') {
      console.log(bodyType)
      var confirm_link = "http://localhost:3000/confirm?job_id=" + job_id.toString()
    }

    var htmlContent = confirm_link

    console.log(htmlContent)
    return htmlContent
  }

}

module.exports = emailContent
