'use strict';

const Alexa = require('alexa-sdk');

const APP_ID = 'amzn1.ask.skill.fe7e7c5b-4a7b-401b-9ff4-68e875230436';

const SKILL_NAME = 'Ole Miss Skill';
const WELCOME_MESSAGE = 'Hello, Hotty Toddy. ' + 'Ask me Ole Miss questions?' +
  ' For a list of questions, you can ask me say help.';

//update to https when available
const STREAM_INFO = {
  title: 'Rebel Radio',
  cardContent: "Rebel Radio 92.1 FM",
  url: 'https://rebelradio.smc.olemiss.edu:8002/listen',
};

const amazonHandlers = require('./handlers/amazonHandlers');
const dateHandlers = require('./handlers/dateHandlers');
const sportsHandlers = require('./handlers/sportsHandlers');

const extraHandlers = {
  'LaunchRequest': function() {
    const speechOutput = WELCOME_MESSAGE;
    this.response.speak(speechOutput).cardRenderer(SKILL_NAME, speechOutput).listen();
    this.emit(':responseReady');
  },
  //Waiting on SSL for streaming audio link
  'PlayRadioIntent': function() {
    //this.response.speak('Enjoy.').audioPlayerPlay('REPLACE_ALL', STREAM_INFO.url, STREAM_INFO.url, null, 0);
    this.response.speak("This function is not available at this time").cardRenderer(SKILL_NAME, "This funcation is not available at this time");
    this.emit(':responseReady');
  },
};

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context, callback);
  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(extraHandlers, amazonHandlers, dateHandlers, sportsHandlers);
  alexa.execute();
};
