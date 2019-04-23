'use strict';
const Alexa = require('alexa-sdk');

const APP_ID = 'amzn1.ask.skill.fe7e7c5b-4a7b-401b-9ff4-68e875230436';

const SKILL_NAME = 'Ole Miss Skill';
const WELCOME_MESSAGE = 'Hello, Hotty Toddy. ' + 'Ask me Ole Miss questions?' +
  'For a list of questions, you can ask me say help.'
const HELP_MESSAGE = 'Ask me questions like: What day do classes start? ' +
  'What Ole Miss sports are playing today? What was the score to the ' +
  'game yesterday?' + " When is advising, registration, finals, spring break,"
  +" last day to add classes, and drop classes?";
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';
const SEMESTER_NAMES = ['Fall', 'First Fall Term', 'Second Fall Term',
  'Winter Intersession', 'Spring', 'First Spring Term', 'Second Spring Term',
  'May Intersession', 'Summer Full Term', 'Summer First Term',
  'Summer Second Term', 'Augest Intersession'
]
const TEAM_SPORTS = ['Football', 'Baseball', 'Softball', 'Men\'s Basketball',
  'Women\'s Basketball', 'Women\'s Soccer', 'Women\'s Volleyball', 'Basketball',
  'Volleyball', 'Soccer'
]
const OTHER_SPORTS = ['Men\'s Tennis', 'Women\'s Tennis', 'Cross Country',
  'Men\'s Golf', 'Women\'s Rifle', 'Women\'s Golf', 'Track & Field', 'Tennis',
  'Golf', 'Rifle'
]

//update to https when available
const STREAM_INFO = {
  title: 'Rebel Radio',
  cardContent: "Rebel Radio 92.1 FM",
  url: 'https://rebelradio.smc.olemiss.edu:8002/listen',
};

const handlers = {

  'LaunchRequest': function() {
    const speechOutput = WELCOME_MESSAGE;
    this.response.speak(speechOutput).cardRenderer(SKILL_NAME, speechOutput).listen();
    this.emit(':responseReady');
  },

  'SemesterStartIntent': function() {
    // delegate to Alexa to collect all the required slots
    let filledSlots = delegateSlotCollection.call(this, function(event) {
      let result = false;
      let slots = event.request.intent.slots;

      if (slots.semester.value) {
        result = true;
      }
      return result;
    });

    // delegateSlotCollection may make an asynchronous call, so there
    // is a chance that filledSlots is null. If it's null we need to
    // stop GetLocationIntent and on the next runtime tick,
    // this.emit(':delegate') which was called from
    // delegateSlotCollection will execute.
    if (!filledSlots) {
      return;
    }

    // at this point, we know that all required slots are filled.
    let slotValues = getSlotValues(filledSlots);

    console.log(JSON.stringify(slotValues));

    let semester = toTitleCase(slotValues.semester.resolved);
    console.log("semester: " + semester);

    if (SEMESTER_NAMES.includes(semester)) {
      let params = {
        TableName: "AcademicCal",
        ProjectionExpression: "#date, #semester, #event",
        FilterExpression: "#semester = :Semester and contains(#event, :Event)",
        ExpressionAttributeNames: {
          "#date": "Date",
          "#semester": "Semester",
          "#event": "Event"
        },
        ExpressionAttributeValues: {
          ":Event": "Classes begin",
          ":Semester": semester
        }
      };

      scanDynamoItem(params, myResult => {
        let say = '';
        myResult.forEach(function(item) {
          say = semester + " semester starts on " + item.Date
        });
        if (say == '') {
          let output = "Date is not available."
          this.response.speak(output).cardRenderer(SKILL_NAME, output);
          this.emit(':responseReady');
        } else {
          say = outputCheck(say)
          this.response.speak(say).cardRenderer(SKILL_NAME, say)
          this.emit(':responseReady');
        }
      });
    } else {
      let say = outputCheck('Sorry, I did not get that semester. Please try again.')
      this.response.speak(say).cardRenderer(SKILL_NAME, say)
      this.emit(':responseReady');
    }
  },

  'SportsListIntent': function() {
    // delegate to Alexa to collect all the required slots
    let filledSlots = delegateSlotCollection.call(this, function(event) {
      let result = false;
      let slots = event.request.intent.slots;

      if (slots.date.value) {
        result = true;
      }
      return result;
    });

    if (!filledSlots) {
      return;
    }

    let slotValues = getSlotValues(filledSlots);
    let date = slotValues.date.resolved;

    if (date.length >= 10) {
      let dd = date.substring(8, 10)
      let yy = date.substring(2, 4)
      let mm = date.substring(5, 7)
      date = mm + "/" + dd + "/" + yy
    } else {
      date = ""
    }

    let params = {
      TableName: "Sports",
      ProjectionExpression: "#date, #sport, Summary, Event, LocationWhere",
      FilterExpression: "#date = :Date",
      ExpressionAttributeNames: {
        "#date": "Date",
        "#sport": "SportType"
      },
      ExpressionAttributeValues: {
        ":Date": date,
      }
    };

    scanDynamoItem(params, myResult => {
      let say = '';
      myResult.forEach(function(item) {
        if (TEAM_SPORTS.includes(item.SportType)) {
          say = say + item.Summary + " " + item.SportType + " plays " +
            item.Event + " at " + item.LocationWhere + ". ";
        } else {
          say = say + item.Summary + " " + item.SportType + " " + item.Event +
            " at " + item.LocationWhere + ". ";
        }
      });
      if (say == '') {
        let output = "No Ole Miss sporting events today."
        this.response.speak(output).cardRenderer(SKILL_NAME, output);
        this.emit(':responseReady');
      } else {
        say = outputCheck(say)
        this.response.speak(say).cardRenderer(SKILL_NAME, say);
        this.emit(':responseReady');
      }
    });
  },

  'SportScoreIntent': function() {
    // delegate to Alexa to collect all the required slots
    let filledSlots = delegateSlotCollection.call(this, function(event) {
      let result = false;
      let slots = event.request.intent.slots;

      if (slots.date.value && slots.sport.value) {
        result = true;
      }
      return result;
    });

    if (!filledSlots) {
      return;
    }

    let slotValues = getSlotValues(filledSlots);
    let date = slotValues.date.resolved;
    let sport = toTitleCase(slotValues.sport.resolved);

    if (date.length == 10) {
      var dd = date.substring(8, 10)
      var yy = date.substring(2, 4)
      var mm = date.substring(5, 7)
      date = mm + "/" + dd + "/" + yy
    } else if (date.length == 8) {
      var yy = date.substring(0, 4)
      var ww = date.substring(6, 8)
      date = getSundayFromWeekNum(ww, yy)
    } else {
      date = ""
    }

    if (TEAM_SPORTS.includes(sport) || OTHER_SPORTS.includes(sport)) {
      var params = {
        TableName: "Sports",
        ProjectionExpression: "#date, #sport, Summary, Event",
        FilterExpression: "contains(#date, :Date) and contains(#sport, :SportType)",
        ExpressionAttributeNames: {
          "#date": "Date",
          "#sport": "SportType"
        },
        ExpressionAttributeValues: {
          ":Date": date,
          ":SportType": sport
        }
      };

      scanDynamoItem(params, myResult => {
        var say = '';
        myResult.forEach(function(item) {
          var regex = /\d+/g;
          var string = item.Summary
          var score = string.match(regex)

          if (string[0] == "W") {
            say = say + item.SportType + " Won" + " aganist " + item.Event + " " +
              score[0] + " to " + score[1] + " "
          } else if (string[0] == "L") {
            say = say + item.SportType + " lost" + " aganist " + item.Event + " " +
              score[0] + " to " + score[1] + " "
          } else {
            say += ''
          }
        });
        if (say == '') {
          var output = "Score is not available."
          this.response.speak(output).cardRenderer(SKILL_NAME, output);
          this.emit(':responseReady');
        } else {
          say = outputCheck(say)
          this.response.speak(say).cardRenderer(SKILL_NAME, say)
          this.emit(':responseReady');
        }
      });
    } else {
      let say = outputCheck("Sorry, I did not get the sport. Try again.")
      this.response.speak(say).cardRenderer(SKILL_NAME, say)
      this.emit(':responseReady');
    }
  },

  'AddClassesIntent': function() {
    // delegate to Alexa to collect all the required slots
    let filledSlots = delegateSlotCollection.call(this, function(event) {
      let result = false;
      let slots = event.request.intent.slots;

      if (slots.semester.value) {
        result = true;
      }
      return result;
    });

    if (!filledSlots) {
      return;
    }

    // at this point, we know that all required slots are filled.
    let slotValues = getSlotValues(filledSlots);

    console.log(JSON.stringify(slotValues));

    let semester = toTitleCase(slotValues.semester.resolved);
    console.log("semester: " + semester);

    let event = "Last day to register";
    if (SEMESTER_NAMES.includes(semester)) {
      let params = {
        TableName: "AcademicCal",
        ProjectionExpression: "#date, #semester, #event",
        FilterExpression: "#semester = :Semester and contains(#event, :Event)",
        ExpressionAttributeNames: {
          "#date": "Date",
          "#semester": "Semester",
          "#event": "Event"
        },
        ExpressionAttributeValues: {
          ":Event": event,
          ":Semester": semester
        }
      };

      scanDynamoItem(params, myResult => {
        let say = '';
        myResult.forEach(function(item) {
          say = "Last day to add classes is " + item.Date;
        });
        if (say == '') {
          let output = "Date is not available."
          this.response.speak(output).cardRenderer(SKILL_NAME, output);
          this.emit(':responseReady');
        } else {
          say = outputCheck(say)
          this.response.speak(say).cardRenderer(SKILL_NAME, say)
          this.emit(':responseReady');
        }
      });
    } else {
      let say = outputCheck('Sorry, I did not get that semester. Please try again.')
      this.response.speak(say).cardRenderer(SKILL_NAME, say)
      this.emit(':responseReady');
    }
  },

  'RegistrationIntent': function() {
    let event = "Registration";
    let params = {
      TableName: "AcademicCal",
      ProjectionExpression: "#date, #semester, #event",
      FilterExpression: "contains(#event, :Event)",
      ExpressionAttributeNames: {
        "#date": "Date",
        "#semester": "Semester",
        "#event": "Event"
      },
      ExpressionAttributeValues: {
        ":Event": event
      }
    };

    scanDynamoItem(params, myResult => {
      let say = '';
      let event = '';
      myResult.forEach(function(item) {
        var date = item.Date.replace("-", "to")
        if (event != item.Event) {
          event = item.Event
          say += item.Event + " starts on " + date + "\n"
        }
      });
      if (say == '') {
        let output = "Date is not available."
        this.response.speak(output).cardRenderer(SKILL_NAME, output);
        this.emit(':responseReady');
      } else {
        say = outputCheck(say)
        this.response.speak(say).cardRenderer(SKILL_NAME, say)
        this.emit(':responseReady');
      }
    });
  },

  'AdvisingIntent': function() {
    let event = "Advising";
    let params = {
      TableName: "AcademicCal",
      ProjectionExpression: "#date, #semester, #event",
      FilterExpression: "contains(#event, :Event)",
      ExpressionAttributeNames: {
        "#date": "Date",
        "#semester": "Semester",
        "#event": "Event"
      },
      ExpressionAttributeValues: {
        ":Event": event
      }
    };

    scanDynamoItem(params, myResult => {
      let say = '';
      let event = '';
      myResult.forEach(function(item) {
        let date = item.Date.replace("-", "to")
        if (event != item.Event) {
          event = item.Event
          say += item.Event + " starts on " + date + "\n"
        }
      });
      if (say == '') {
        let output = "Date is not available."
        this.response.speak(output).cardRenderer(SKILL_NAME, output);
        this.emit(':responseReady');
      } else {
        say = outputCheck(say)
        this.response.speak(say).cardRenderer(SKILL_NAME, say)
        this.emit(':responseReady');
      }
    });
  },

  'WithdrawIntent': function() {
    // delegate to Alexa to collect all the required slots
    let filledSlots = delegateSlotCollection.call(this, function(event) {
      let result = false;
      let slots = event.request.intent.slots;

      if (slots.semester.value) {
        result = true;
      }
      return result;
    });

    if (!filledSlots) {
      return;
    }

    // at this point, we know that all required slots are filled.
    let slotValues = getSlotValues(filledSlots);

    console.log(JSON.stringify(slotValues));

    let semester = toTitleCase(slotValues.semester.resolved);
    console.log("semester: " + semester);

    let event = 'Deadline for course withdrawals n';
    if (SEMESTER_NAMES.includes(semester)) {
      let params = {
        TableName: "AcademicCal",
        ProjectionExpression: "#date, #semester, #event",
        FilterExpression: "#semester = :Semester and contains(#event, :Event)",
        ExpressionAttributeNames: {
          "#date": "Date",
          "#semester": "Semester",
          "#event": "Event"
        },
        ExpressionAttributeValues: {
          ":Event": event,
          ":Semester": semester
        }
      };

      scanDynamoItem(params, myResult => {
        let say = '';
        myResult.forEach(function(item) {
          say = "Last day to withdraw from classes is " + item.Date;
        });
        if (say == '') {
          let output = "Date is not available."
          this.response.speak(output).cardRenderer(SKILL_NAME, output);
          this.emit(':responseReady');
        } else {
          say = outputCheck(say)
          this.response.speak(say).cardRenderer(SKILL_NAME, say)
          this.emit(':responseReady');
        }
      });
    } else {
      let say = outputCheck('Sorry, I did not get that semester. Please try again.')
      this.response.speak(say).cardRenderer(SKILL_NAME, say)
      this.emit(':responseReady');
    }
  },

  'DropClassesIntent': function() {
    // delegate to Alexa to collect all the required slots
    let filledSlots = delegateSlotCollection.call(this, function(event) {
      let result = false;
      let slots = event.request.intent.slots;

      if (slots.semester.value) {
        result = true;
      }
      return result;
    });

    if (!filledSlots) {
      return;
    }

    // at this point, we know that all required slots are filled.
    let slotValues = getSlotValues(filledSlots);

    console.log(JSON.stringify(slotValues));

    let semester = toTitleCase(slotValues.semester.resolved);
    console.log("semester: " + semester);

    let event = 'Mandatory drop date';
    if (SEMESTER_NAMES.includes(semester)) {
      let params = {
        TableName: "AcademicCal",
        ProjectionExpression: "#date, #semester, #event",
        FilterExpression: "#semester = :Semester and contains(#event, :Event)",
        ExpressionAttributeNames: {
          "#date": "Date",
          "#semester": "Semester",
          "#event": "Event"
        },
        ExpressionAttributeValues: {
          ":Event": event,
          ":Semester": semester
        }
      };

      scanDynamoItem(params, myResult => {
        let say = '';
        myResult.forEach(function(item) {
          say = "Last day to drop classes is " + item.Date;
        });
        if (say == '') {
          let output = "Date is not available."
          this.response.speak(output).cardRenderer(SKILL_NAME, output);
          this.emit(':responseReady');
        } else {
          say = outputCheck(say)
          this.response.speak(say).cardRenderer(SKILL_NAME, say)
          this.emit(':responseReady');
        }
      });
    } else {
      let say = outputCheck('Sorry, I did not get that semester. Please try again.')
      this.response.speak(say).cardRenderer(SKILL_NAME, say)
      this.emit(':responseReady');
    }
  },

  'FinalsIntent': function() {
    // delegate to Alexa to collect all the required slots
    let filledSlots = delegateSlotCollection.call(this, function(event) {
      let result = false;
      let slots = event.request.intent.slots;

      if (slots.semester.value) {
        result = true;
      }
      return result;
    });

    if (!filledSlots) {
      return;
    }

    // at this point, we know that all required slots are filled.
    let slotValues = getSlotValues(filledSlots);

    console.log(JSON.stringify(slotValues));

    let semester = toTitleCase(slotValues.semester.resolved);
    console.log("semester: " + semester);

    let event = "Final";
    if (SEMESTER_NAMES.includes(semester)) {
      let params = {
        TableName: "AcademicCal",
        ProjectionExpression: "#date, #semester, #event",
        FilterExpression: "#semester = :Semester and contains(#event, :Event)",
        ExpressionAttributeNames: {
          "#date": "Date",
          "#semester": "Semester",
          "#event": "Event"
        },
        ExpressionAttributeValues: {
          ":Event": event,
          ":Semester": semester
        }
      };

      scanDynamoItem(params, myResult => {
        let say = '';
        myResult.forEach(function(item) {
          let date = item.Date.replace("-", "to")
          say = "Finals week is " + date;
        });
        if (say == '') {
          let output = "Date is not available."
          this.response.speak(output).cardRenderer(SKILL_NAME, output);
          this.emit(':responseReady');
        } else {
          say = outputCheck(say)
          this.response.speak(say).cardRenderer(SKILL_NAME, say)
          this.emit(':responseReady');
        }
      });
    } else {
      let say = outputCheck('Sorry, I did not get that semester. Please try again.')
      this.response.speak(say).cardRenderer(SKILL_NAME, say)
      this.emit(':responseReady');
    }
  },

  'SpringBreakIntent': function() {
    let event = 'SPRING BREAK';
    let params = {
      TableName: "AcademicCal",
      ProjectionExpression: "#date, #semester, #event",
      FilterExpression: "contains(#event, :Event)",
      ExpressionAttributeNames: {
        "#date": "Date",
        "#semester": "Semester",
        "#event": "Event"
      },
      ExpressionAttributeValues: {
        ":Event": event
      }
    };

    scanDynamoItem(params, myResult => {
      let say = '';
      myResult.forEach(function(item) {
        let date = item.Date.replace("-", "to")
        say = item.Event + " is " + date
      });
      if (say == '') {
        let output = "Date is not available."
        this.response.speak(output).cardRenderer(SKILL_NAME, output);
        this.emit(':responseReady');
      } else {
        say = outputCheck(say)
        this.response.speak(say).cardRenderer(SKILL_NAME, say)
        this.emit(':responseReady');
      }
    });
  },

  //Waiting on SSL for streaming audio link
  'PlayRadioIntent': function() {
    //this.response.speak('Enjoy.').audioPlayerPlay('REPLACE_ALL', STREAM_INFO.url, STREAM_INFO.url, null, 0);
    this.response.speak("This function is not available at this time").cardRenderer(SKILL_NAME, "This funcation is not available at this time");
    this.emit(':responseReady');
  },

  'AMAZON.HelpIntent': function() {
    const speechOutput = HELP_MESSAGE;
    const reprompt = HELP_REPROMPT;

    this.response.speak(speechOutput).cardRenderer(SKILL_NAME, speechOutput).listen(reprompt);
    this.emit(':responseReady');
  },

  'AMAZON.CancelIntent': function() {
    this.response.speak(STOP_MESSAGE);
    this.emit(':responseReady');
  },

  'AMAZON.ResumeIntent': function() {
    this.emit('PlayRadioIntent');
  },

  'AMAZON.StopIntent': function() {
    this.response.speak('Okay.').audioPlayerStop();
    this.emit(':responseReady');
  },

  'AMAZON.PauseIntent': function() {
    this.emit(':AMAZON.StopIntent');
  },

  'AMAZON.FallbackIntent': function() {
    const say = "Sorry I did not get that. Please retry or say help."
    this.response.speak(say).cardRenderer(SKILL_NAME, say).listen();
    this.emit(':responseReady');
  },
};

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

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context, callback);
  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};
