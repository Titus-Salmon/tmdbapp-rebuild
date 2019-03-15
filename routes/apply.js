var express = require('express');
var router = express.Router();

/* on browser's GET request, render apply page. */
// '/apply' is automatically assumed for '/'
router.get('/', function (req, res, next) {
  res.render('apply', {
    title: 'Application Form'
  });
});

router.post('/formPost', (req, res, next) => { //take POST request data from teamster apply page &:
  //check to see if ssn entered already exists in db, & if not:
  //put POST request data into database table
  const postBody = req.body;

  console.log('Object.values(postBody)[0][21] =');
  console.log(Object.values(postBody)[0][21]); //social security number

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //the following puts 'postBody' json into dynamodb database, IF ssn not duplicated/////////////////////////////////////////
  //can/should this be made more modular? <--maybe not...
  var AWS = require('aws-sdk');
  var dyn = new AWS.DynamoDB({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
    accessKeyId: 'DEFAULT_ACCESS_KEY', // needed if you don't have aws credentials at all in env
    secretAccessKey: 'DEFAULT_SECRET' // needed if you don't have aws credentials at all in env
  });

  //if Object.values(postBody)[0][21] does not already exist in database, do the putTable method
  //[1] first, we scan database to see if the ssn (Object.values(postBody)[0][21]) exists in db
  var params = {
    TableName: 'teamster-application-db',
    /* required */
    ExpressionAttributeValues: {
      ":ssn": {
        "S": Object.values(postBody)[0][21] //social security number
      }
    },
    FilterExpression: "ssn = :ssn"
  };

  dyn.scan(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    //else console.log(data); // successful response --logs entire data object
    if (data !== null) {

      if (Object.values(data.Items)[0] == null) {
        //[2a] THEN, if social security # does not exist in database,
        //add user data from application form to database
        console.log('undefined value');
        console.log('this social security # does not exist in database');
        console.log('therefore entry is being added to database');

        var params = {
          TableName: "teamster-application-db",
          Item: { // a map of attribute name to AttributeValue
            union_number: {
              'S': Object.values(postBody)[0][0]
            },
            date: {
              'S': Object.values(postBody)[0][1]
            },
            lname: {
              'S': Object.values(postBody)[0][2]
            },
            lname_lowercase: {
              'S': Object.values(postBody)[0][2].toLowerCase()
            },
            fname: {
              'S': Object.values(postBody)[0][3]
            },
            mi: {
              'S': Object.values(postBody)[0][4]
            },
            occupation: {
              'S': Object.values(postBody)[0][5]
            },
            address: {
              'S': Object.values(postBody)[0][6]
            },
            phone: {
              'S': Object.values(postBody)[0][7]
            },
            city: {
              'S': Object.values(postBody)[0][8]
            },
            state: {
              'S': Object.values(postBody)[0][9]
            },
            zip: {
              'S': Object.values(postBody)[0][10]
            },
            employer: {
              'S': Object.values(postBody)[0][11]
            },
            employment_date: {
              'S': Object.values(postBody)[0][12]
            },
            employer_address: {
              'S': Object.values(postBody)[0][13]
            },
            employer_phone: {
              'S': Object.values(postBody)[0][14]
            },
            employer_city: {
              'S': Object.values(postBody)[0][15]
            },
            employer_state: {
              'S': Object.values(postBody)[0][16]
            },
            employer_zip: {
              'S': Object.values(postBody)[0][17]
            },
            fee: {
              'S': Object.values(postBody)[0][18]
            },
            paid_to: {
              'S': Object.values(postBody)[0][19]
            },
            dob: {
              'S': Object.values(postBody)[0][20]
            },
            ssn: { //'ssn' is primary key for 'teamster-application-database' table; must always be included in 'putItem' method
              'S': Object.values(postBody)[0][21]
            },
            membership: {
              'S': Object.values(postBody)[0][22]
            },
            previous_union_number: {
              'S': Object.values(postBody)[0][23]
            },
          }
        };
        //if ssn does not already exist in table do dyn.putItem
        dyn.putItem(params, function (err, data) {
          if (err) {
            console.log(err)
          } // an error occurred
          else {
            /**GO TO SUCCESS PAGE */
            res.render('successful-application', {
              title: 'SUCCESS'
            });
            console.log(data)
          } // successful response
        });

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


        for (n = 0; n < 24; n++) {
          console.log(Object.values(postBody)[0][n]);
        }

        console.log(postBody);
        console.log(Object.values(postBody)[0]);

      } else {

        res.render('ssn-error', {
          title: 'SSN Exists'
        });
        console.log('THIS SSN ALREADY EXYSTS IN DB');
        console.log('THEREFORE THIS ATTEMPTED ENTRY NOT ADDED TO DB');
        console.log('scan results =')
        console.log(data.Items);
        console.log('scan results2 =')
        console.log(Object.values(data.Items)[0]['ssn']['S']);
      }
    }
  });
});

module.exports = router;