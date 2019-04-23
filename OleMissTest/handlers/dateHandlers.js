/*
Intents that return dates:
  SemesterStartIntent,
  AddClassesIntent,
  RegistrationIntent,
  WithdrawIntent,
  DropClassesIntent,
  FinalsIntent,
  SpringBreakIntent
*/

const SKILL_NAME = 'Ole Miss Skill';
const scanDynamoItem = require('../helper_Functions').scanDynamoItem
const toTitleCase = require('../helper_Functions').toTitleCase
const outputCheck = require('../helper_Functions').outputCheck
const getSlotValues = require('../helper_Functions').getSlotValues
const delegateSlotCollection = require('../helper_Functions').delegateSlotCollection

const SEMESTER_NAMES = ['Fall', 'First Fall Term', 'Second Fall Term',
  'Winter Intersession', 'Spring', 'First Spring Term', 'Second Spring Term',
  'May Intersession', 'Summer Full Term', 'Summer First Term',
  'Summer Second Term', 'Augest Intersession'
]

const dateHandlers = {
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

}

module.exports = dateHandlers
