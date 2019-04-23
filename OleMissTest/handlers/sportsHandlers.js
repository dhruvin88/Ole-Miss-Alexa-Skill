/*
Intents with sports:
  SportsListIntent,
  SportScoreIntent
*/

const SKILL_NAME = 'Ole Miss Skill';
const scanDynamoItem = require('../helper_Functions').scanDynamoItem
const toTitleCase = require('../helper_Functions').toTitleCase
const outputCheck = require('../helper_Functions').outputCheck
const getSundayFromWeekNum = require('../helper_Functions').getSundayFromWeekNum
const getSlotValues = require('../helper_Functions').getSlotValues
const delegateSlotCollection = require('../helper_Functions').delegateSlotCollection

const TEAM_SPORTS = ['Football', 'Baseball', 'Softball', 'Men\'s Basketball',
  'Women\'s Basketball', 'Women\'s Soccer', 'Women\'s Volleyball', 'Basketball',
  'Volleyball', 'Soccer'
]
const OTHER_SPORTS = ['Men\'s Tennis', 'Women\'s Tennis', 'Cross Country',
  'Men\'s Golf', 'Women\'s Rifle', 'Women\'s Golf', 'Track & Field', 'Tennis',
  'Golf', 'Rifle'
]

const sportsHandlers = {
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
}

module.exports = sportsHandlers
