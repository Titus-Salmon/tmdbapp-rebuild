var express = require('express');
var router = express.Router();

/* on browser's GET request, render successful-edit page. */
// '/apply' is automatically assumed for '/'
router.get('/', function (req, res, next) {
  res.render('successful-edit', {
    title: 'Edit Successful'
  });
});

//**Take POST request from browser & do a dyn.putItem in order to update database
router.post("/EditSuccess", function (req, res, next) {
  const editPostBody = req.body; //request.body is made by bodyparser.urlencoded, which parses the http message for sent data
  console.log("editPostBody=");
  console.log(editPostBody);

  console.log("editPostBody[\'union_number\']=");
  console.log(editPostBody['union_number']);


  var AWS = require('aws-sdk');
  var dyn = new AWS.DynamoDB({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    accessKeyId: 'DEFAULT_ACCESS_KEY', // needed if you don't have aws credentials at all in env
    secretAccessKey: 'DEFAULT_SECRET' // needed if you don't have aws credentials at all in env
  });


  var params = {
    TableName: "teamster-application-db",
    Item: { // a map of attribute name to AttributeValue
      union_number: {
        'S': editPostBody['union_number']
      },
      date: {
        'S': editPostBody['date']
      },
      lname: {
        'S': editPostBody['lname']
      },
      fname: {
        'S': editPostBody['fname']
      },
      mi: {
        'S': editPostBody['mi']
      },
      occupation: {
        'S': editPostBody['occupation']
      },
      address: {
        'S': editPostBody['address']
      },
      phone: {
        'S': editPostBody['phone']
      },
      city: {
        'S': editPostBody['city']
      },
      state: {
        'S': editPostBody['state']
      },
      zip: {
        'S': editPostBody['zip']
      },
      employer: {
        'S': editPostBody['employer']
      },
      employment_date: {
        'S': editPostBody['employment_date']
      },
      employer_address: {
        'S': editPostBody['employer_address']
      },
      employer_phone: {
        'S': editPostBody['employer_phone']
      },
      employer_city: {
        'S': editPostBody['employer_city']
      },
      employer_state: {
        'S': editPostBody['employer_state']
      },
      employer_zip: {
        'S': editPostBody['employer_zip']
      },
      fee: {
        'S': editPostBody['fee']
      },
      paid_to: {
        'S': editPostBody['paid_to']
      },
      dob: {
        'S': editPostBody['dob']
      },
      ssn: { //'ssn' is primary key for 'teamster-application-database' table; must always be included in 'putItem' method
        'S': editPostBody['ssn']
      },
      membership: {
        'S': editPostBody['membership']
      },
      previous_union_number: {
        'S': editPostBody['previous_union_number']
      },
    }
  };
  //regardless of whether ssn already exists in table do dyn.putItem
  dyn.putItem(params, function (err, data) {
    if (err) {
      console.log(err)
    } // an error occurred
    else {
      console.log('data=');
      console.log(data);
    } // successful response
  });
});

module.exports = router;