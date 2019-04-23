//=========================================================================================================================================
//Helper Functions
//=========================================================================================================================================

function queryDynamoItem(params, callback) {
  var AWS = require('aws-sdk');
  AWS.config.update({
    region: 'us-east-1'
  });

  var docClient = new AWS.DynamoDB.DocumentClient();

  console.log('reading item from DynamoDB table');

  docClient.query(params, (err, data) => {
    if (err) {
      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
      callback(data.Items);
    }
  });
}

function scanDynamoItem(params, callback) {
  var AWS = require('aws-sdk');
  AWS.config.update({
    region: 'us-east-1'
  });

  var docClient = new AWS.DynamoDB.DocumentClient();

  console.log('reading item from DynamoDB table');

  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
      callback(data.Items);
    }
  });
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

function outputCheck(str) {
  str = str.replace("&", " and ");
  return str
}

function getSundayFromWeekNum(weekNum, year) {
  var sunday = new Date(year, 0, (1 + (weekNum - 1) * 7));
  while (sunday.getDay() !== 0) {
    sunday.setDate(sunday.getDate() - 1);
  }
  var date = ("0" + (sunday.getMonth() + 1)).slice(-2) + "/" +
    ("0" + sunday.getDate()).slice(-2);

  date = date.substring(0, date.length - 1);
  return date;
}

function getSlotValues(filledSlots) {
  const slotValues = {};

  console.log(`The filled slots: ${JSON.stringify(filledSlots)}`);
  Object.keys(filledSlots).forEach((item) => {
    const name = filledSlots[item].name;

    if (filledSlots[item] &&
      filledSlots[item].resolutions &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
      switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
        case 'ER_SUCCESS_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
            isValidated: true,
          };
          break;
        case 'ER_SUCCESS_NO_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            resolved: filledSlots[item].value,
            isValidated: false,
          };
          break;
        default:
          break;
      }
    } else {
      slotValues[name] = {
        synonym: filledSlots[item].value,
        resolved: filledSlots[item].value,
        isValidated: false,
      };
    }
  }, this);

  return slotValues;
}

function delegateSlotCollection(func) {
  console.log("in delegateSlotCollection");
  console.log("current dialogState: " + this.event.request.dialogState);

  if (func) {
    if (func(this.event)) {
      this.event.request.dialogState = "COMPLETED";
      return this.event.request.intent.slots;
    }
  }

  if (this.event.request.dialogState === "STARTED") {
    console.log("in STARTED");
    console.log(JSON.stringify(this.event));
    var updatedIntent = this.event.request.intent;
    // optionally pre-fill slots: update the intent object with slot values
    // for which you have defaults, then return Dialog.Delegate with this
    // updated intent in the updatedIntent property

    this.emit(":delegate", updatedIntent);
  } else if (this.event.request.dialogState !== "COMPLETED") {
    console.log("in not completed");
    //console.log(JSON.stringify(this.event));
    this.emit(":delegate", updatedIntent);
  } else {
    console.log("in completed");
    //console.log("returning: "+ JSON.stringify(this.event.request.intent));
    // Dialog is now complete and all required slots should be filled,
    // so call your normal intent handler.
    return this.event.request.intent.slots;
  }
  return null;
}

module.exports = {
    queryDynamoItem: queryDynamoItem,
    scanDynamoItem: scanDynamoItem,
    toTitleCase: toTitleCase,
    outputCheck: outputCheck,
    getSundayFromWeekNum: getSundayFromWeekNum,
    getSlotValues: getSlotValues,
    delegateSlotCollection: delegateSlotCollection,
};