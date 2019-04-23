/* 
Amazon required intents:
  HelpIntent,
  CancelIntent,
  ResumeIntent,
  StopIntent,
  FallbackIntent
*/

const SKILL_NAME = 'Ole Miss Skill';
const HELP_MESSAGE = 'Ask me questions like: What day do classes start? ' +
  'What Ole Miss sports are playing today? What was the score to the ' +
  'game yesterday?' + " When is advising, registration, finals, spring break," +
  " last day to add classes, and drop classes?";
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const amazonHanders = {

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
}
module.exports = amazonHanders
