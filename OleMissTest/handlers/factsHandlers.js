/*
Intents with Ole Miss Facts
*/

const SKILL_NAME = 'Ole Miss Skill';
const scanDynamoItem = require('../helper_Functions').scanDynamoItem
const toTitleCase = require('../helper_Functions').toTitleCase
const outputCheck = require('../helper_Functions').outputCheck
const getSundayFromWeekNum = require('../helper_Functions').getSundayFromWeekNum
const getSlotValues = require('../helper_Functions').getSlotValues
const delegateSlotCollection = require('../helper_Functions').delegateSlotCollection

const sportsHandlers = {
  'FactIntent': function() {
  }
}

module.exports = factsHandlers
