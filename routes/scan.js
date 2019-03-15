var express = require("express");
var router = express.Router();

/* render scan.hbs when GET request automatically generated from browser scan page. */
// '/scan' is automatically assumed for '/'
router.get("/", function (req, res, next) {
  res.render("scan", {
    title: "DatabaseSearch"
  });
});

//**Take POST request from browser & send POST response back after scanning, filtering & paginating through results*/
//'/scan/results' is automatically assumed for '/results', so in scan.hbs, we have to send POST request
//to /scan/results ... confusing, but critical to understand.
router.post("/results", function (req, res, next) {
  const postBody = req.body; //request.body is made by bodyparser.urlencoded, which parses the http message for sent data
  console.log("postBody=");
  console.log(postBody);

  /**SCAN and FILTER and PAGINATE(server-side) table******************************************************************************** */
  var AWS = require("aws-sdk");
  var dyn = new AWS.DynamoDB({
    region: "localhost",
    endpoint: "http://localhost:8000",
    accessKeyId: "DEFAULT_ACCESS_KEY", // needed if you don't have aws credentials at all in env
    secretAccessKey: "DEFAULT_SECRET" // needed if you don't have aws credentials at all in env
  });

  /**************************************************************************************************************************/
  /**************************************************************************************************************************/
  /**************************************************************************************************************************/
  /**BEGIN setting up condition enabling retrieval of ALL database items, if search fields are blank ************************/
  /**(you can delete this if statement if don't want this functionality) */
  if (postBody["ssn"] == "" && postBody["dob"] == "" && postBody["lname"] == "" && postBody["fname"] == "" && postBody["occupation"] == "" && postBody["employer"] == "" && postBody["date"] == "") {
    var params_emptyfields = {
      TableName: "teamster-application-db"
    }

    var scanAccumulator_emptyfields = [];

    //************************************************************************************************ */
    //**BEGIN modified dynamodb basic scan to account for server-side pagination ***********************/
    dyn.scan(params_emptyfields, function scanUntilDone(err, data) {
      if (err) {
        console.log(err, err.stack);
      } else {
        // do something with this page of 0-13 results
        if (data.LastEvaluatedKey) {
          //if there is a LastEvaluatedKey
          params.ExclusiveStartKey = data.LastEvaluatedKey;
          dyn.scan(params, scanUntilDone); //keep scanning through subsequent paginations

          scanAccumulator_emptyfields.push(data.Items); //add subsequent rounds of scan results to scanAccumulator
          //(AFTER LastEvaluatedKey exists)
        } else {
          // all results processed. done
          scanAccumulator_emptyfields.push(data.Items); //add 1st round of scan results to scanAccumulator
          //(BEFORE there is any LastEvaluatedKey)
          for (int = 0; int < scanAccumulator_emptyfields.length; int++) {
            console.log("(scanAccumulator_emptyfields.length - 1) - (int) =");
            console.log(scanAccumulator_emptyfields.length - 1 - int);
            console.log(
              "scanAccumulator_emptyfields[(scanAccumulator_emptyfields.length-1) - (int)] ="
            );
            console.log(scanAccumulator_emptyfields[scanAccumulator_emptyfields.length - 1 - int]);
            //res.send(scanAccumulator[(scanAccumulator.length - 1) - (int)]);
          }
          console.log("scanAccumulator_emptyfields =");
          console.log(scanAccumulator_emptyfields);
          //console.log(JSON.parse(scanAccumulator));
          res.send(scanAccumulator_emptyfields);
        }
      }
    });
    //**END modified dynamodb basic scan to account for server-side pagination ***********************/
    //************************************************************************************************ */
  }
  /**END setting up condition enabling retrieval of ALL database items, if search fields are blank ************************/
  /**************************************************************************************************************************/
  /**************************************************************************************************************************/
  /**************************************************************************************************************************/
  else {
    var filterExpArray = []; // base array that holds POST data (input from hbs template) for FilterExpression
    var filterExpString = []; //one element array that holds string for FilterExpression

    var scanAccumulator = []; // base array that holds response POST data (from database; this file)
    //to be sent back to browser

    var ssn_exp;
    var dob_exp;
    var lname_exp;
    var fname_exp;
    var occ_exp;
    var empl_exp;
    var AppDate_exp;

    if (postBody["ssn"] !== "") {
      //if data input in html form not empty, push string for FilterExpression to filterExpArray
      ssn_exp = "begins_with (#soc_sec, :ssn)"; //changed from 'contains' to 'begin_with' to ensure scan searches from beginning of word, not anywhere within word
      filterExpArray.push(ssn_exp);
    }
    if (postBody["dob"] !== "") {
      dob_exp = "begins_with (#d_o_b, :dob)";
      filterExpArray.push(dob_exp);
    }
    if (postBody["lname"] !== "") {
      lname_exp = "begins_with (#last_name, :lname)";
      filterExpArray.push(lname_exp);
    }
    if (postBody["fname"] !== "") {
      fname_exp = "begins_with (#first_name, :fname)";
      filterExpArray.push(fname_exp);
    }
    if (postBody["occupation"] !== "") {
      occ_exp = "begins_with (#occu_pation, :occupation)";
      filterExpArray.push(occ_exp);
    }
    if (postBody["employer"] !== "") {
      empl_exp = "begins_with (#empl_oyer, :employer)";
      filterExpArray.push(empl_exp);
    }
    if (postBody["date"] !== "") {
      AppDate_exp = "begins_with (#app_date, :date)";
      filterExpArray.push(AppDate_exp);
    }

    console.log("filterExpArray.length =");
    console.log(filterExpArray.length);

    if (filterExpArray.length > 1) {
      for (n = 0; n < filterExpArray.length - 1; n++) {
        //add " AND " to each element in array, exept last
        filterExpArray.splice(n, 1, filterExpArray[n] + " AND ");
      }
    }

    console.log("filterExpArray = ");
    console.log(filterExpArray);

    function filterExpFunc() {
      if (filterExpArray.length == 1) {
        //if base array that holds POST data has one element
        var fE = filterExpArray[0]; //call that element 'fE'
        filterExpString.push(fE); //and push 'fE' into array that holds string for FilterExpression
      } else {
        if (filterExpArray.length > 1) {
          //if base array that holds POST data has MORE than one element
          for (m = 0; m < filterExpArray.length - 1; m++) {
            //iterate through each of the elements in the array
            var fE = (filterExpArray[m] += filterExpArray[m + 1]); //call each of them 'fE', in turn, and
            filterExpString.push(fE); //push each of them into array that holds string for FilterExpression
          }
        }
      }

      console.log("fE = ");
      console.log(fE);
      console.log("filterExpString = ");
      console.log(filterExpString);
    }

    filterExpFunc();
    //console.log('filterExp = '+fE);

    {
      var params = {
        TableName: "teamster-application-db",
        /* required */
        ExpressionAttributeNames: {
          //"#last_name": Object.keys(postBody)[0], //lname
          //"#first_name": Object.keys(postBody)[1] //fname
        },
        ExpressionAttributeValues: {
          //":lname": {
          //  "S": Object.values(postBody)[0] //Smith
          //},
          //":fname": {
          //  "S": Object.values(postBody)[1] //John
          //},
        },
        //Limit: 13, //sets the # of items scanned from entire database
        //normally, this paramater would not be used, but i'm currently using it
        //to test if pagination is working.
        /******************************************************* *************/
        /******************************************************* *************/
        //**** */COMMENT Limit PARAMETER OUT WHEN PAGINATION IS WORKING *****//
        /********************************************************** **********/
        /********************************************************** **********/
        FilterExpression: filterExpString[0]
        //FilterExpression: 'contains (#last_name, :lname) AND  contains (#first_name, :fname)'
        //FilterExpression: 'contains (#last_name, :lname)'
      };

      if (postBody["ssn"] !== "") {
        //if postBody not empty
        params["ExpressionAttributeNames"]["#soc_sec"] = Object.keys(postBody)[0]; //set value of params = to what was entered for postBody
        params["ExpressionAttributeValues"][":ssn"] = {
          S: Object.values(postBody)[0]
        };
      }
      if (postBody["dob"] !== "") {
        params["ExpressionAttributeNames"]["#d_o_b"] = Object.keys(postBody)[1];
        params["ExpressionAttributeValues"][":dob"] = {
          S: Object.values(postBody)[1]
        };
      }
      if (postBody["lname"] !== "") {
        params["ExpressionAttributeNames"]["#last_name"] = Object.keys(
          postBody
        )[2];
        params["ExpressionAttributeValues"][":lname"] = {
          S: Object.values(postBody)[2]
        };
        console.log('Object.values(postBody)[2] =');
        console.log(Object.values(postBody)[2]); //i.e., Smith
      }
      if (postBody["fname"] !== "") {
        params["ExpressionAttributeNames"]["#first_name"] = Object.keys(
          postBody
        )[3];
        params["ExpressionAttributeValues"][":fname"] = {
          S: Object.values(postBody)[3]
        };
      }
      if (postBody["occupation"] !== "") {
        params["ExpressionAttributeNames"]["#occu_pation"] = Object.keys(
          postBody
        )[4];
        params["ExpressionAttributeValues"][":occupation"] = {
          S: Object.values(postBody)[4]
        };
      }
      if (postBody["employer"] !== "") {
        params["ExpressionAttributeNames"]["#empl_oyer"] = Object.keys(
          postBody
        )[5];
        params["ExpressionAttributeValues"][":employer"] = {
          S: Object.values(postBody)[5]
        };
      }
      if (postBody["date"] !== "") {
        params["ExpressionAttributeNames"]["#app_date"] = Object.keys(
          postBody
        )[6];
        params["ExpressionAttributeValues"][":date"] = {
          S: Object.values(postBody)[6]
        };
      }

      console.log('params["ExpressionAttributeValues"] = '); //{ ':lname': { S: 'Smith' }, ':fname': { S: 'John' } }
      console.log(params["ExpressionAttributeValues"]);
      console.log('params["ExpressionAttributeNames"] = '); //{ '#last_name': 'lname', '#first_name': 'fname' }
      console.log(params["ExpressionAttributeNames"]);
      console.log('params["FilterExpression"] = ');
      console.log(params["FilterExpression"]);
      console.log("params = "); //{ '#last_name': 'lname', '#first_name': 'fname' }
      console.log(params); //{ '#last_name': 'lname', '#first_name': 'fname' }

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
              console.log(
                "scanAccumulator[(scanAccumulator.length-1) - (int)] ="
              );
              console.log(scanAccumulator[scanAccumulator.length - 1 - int]);
              //res.send(scanAccumulator[(scanAccumulator.length - 1) - (int)]);
            }
            console.log("scanAccumulator =");
            console.log(scanAccumulator);
            //console.log(JSON.parse(scanAccumulator));

            console.log('scanAccumulator.length=');
            console.log(scanAccumulator.length);
            console.log('scanAccumulator[0].length=');
            console.log(scanAccumulator[0].length);

            res.send(scanAccumulator);
          }
        }
      });
      //**END modified dynamodb basic scan to account for server-side pagination ***********************/
      //************************************************************************************************ */

    }
  }




});

module.exports = router;