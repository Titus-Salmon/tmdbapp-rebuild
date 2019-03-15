var express = require("express");
var router = express.Router();

/* on browser's GET request, render Edit Entry page. */
// '/apply' is automatically assumed for '/'
router.get("/", function(req, res, next) {
  res.render("edit-entry", {
    title: "Edit Entry"
  });
});

router.post("/EditEntry", (req, res, next) => {//take POST request data from Edit Entry page &:
  var scanAccumulator = []; // base array that holds response POST data (from database; this file)
  //to be sent back to browser
  const postBodySSN = req.body;

  console.log("postBodySSN =");
  console.log(postBodySSN); //social security number
  console.log("postBodySSN['ssn'] =");
  console.log(postBodySSN["ssn"]); //social security number

  /**************************************************************************************************************************** */
  //BEGIN SCANNING dynamodb with the ssn sent from browser POST req & send back user info to populate Edit Entry form
  /**************************************************************************************************************************** */
  //can/should this be made more modular? <--maybe not...
  var AWS = require("aws-sdk");
  var dyn = new AWS.DynamoDB({
    region: "localhost",
    endpoint: "http://localhost:8000",
    accessKeyId: "DEFAULT_ACCESS_KEY", // needed if you don't have aws credentials at all in env
    secretAccessKey: "DEFAULT_SECRET" // needed if you don't have aws credentials at all in env
  });

  //if Object.values(postBody)[0][21] does not already exist in database, do the putTable method
  //[1] first, we scan database to see if the ssn (Object.values(postBody)[0][21]) exists in db
  var params = {
    TableName: "teamster-application-db",
    /* required */
    ExpressionAttributeValues: {
      ":ssn": {
        S: postBodySSN["ssn"] //social security number
      }
    },
    FilterExpression: "ssn = :ssn"
  };

  //************************************************************************************************ */
  //**BEGIN modified dynamodb basic scan to account for server-side pagination ***********************/
  dyn.scan(params, function scanUntilDone(err, data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      // do something with this page of 0-13 results
      if (data.LastEvaluatedKey) {
        //if there is a LastEvaluatedKey
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        dyn.scan(params, scanUntilDone); //keep scanning through subsequent paginations

        scanAccumulator.push(data.Items); //add subsequent rounds of scan results to scanAccumulator
        //(AFTER LastEvaluatedKey exists)
      } else {
        // all results processed. done
        scanAccumulator.push(data.Items); //add 1st round of scan results to scanAccumulator
        //(BEFORE there is any LastEvaluatedKey)
        for (int = 0; int < scanAccumulator.length; int++) {
          console.log("(scanAccumulator.length - 1) - (int) =");
          console.log(scanAccumulator.length - 1 - int);
          console.log("scanAccumulator[(scanAccumulator.length-1) - (int)] =");
          console.log(scanAccumulator[scanAccumulator.length - 1 - int]);
          //res.send(scanAccumulator[(scanAccumulator.length - 1) - (int)]);
        }
        console.log("scanAccumulator =");
        console.log(scanAccumulator);
        console.log("scanAccumulator[0][0] =");
        console.log(scanAccumulator[0][0]);
        //console.log('JSON.parse(scanAccumulator)=');
        //console.log(JSON.parse(scanAccumulator));
        res.send(scanAccumulator); //SEND PERSON'S DATA BACK TO BROWSER TO POPULATE FORM
        //res.send(scanAccumulator[0][0]);
      }
    }
  });
  //**END modified dynamodb basic scan to account for server-side pagination ***********************/
  //************************************************************************************************ */

  /**************************************************************************************************************************** */
  //END SCANNING dynamodb with the ssn sent from browser POST req & send back user info to populate Edit Entry form
  /**************************************************************************************************************************** */
});

module.exports = router;
