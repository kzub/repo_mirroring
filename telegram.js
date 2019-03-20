const request = require('request-promise-native');
const config = require('./config.js');
const log = require('./logger').create('TELEGRAMM');

const botURL = `${config.telegram.apiUri}/bot${config.telegram.token}/`;
const recipients = {
  owner: config.telegram.owner,
};

async function botCmd(method, params) {
  const url = botURL + method;
  const opts = {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
    },
  };
  // console.log(url, opts);
  return request(url, opts);
}

exports.send = async (msg, who) => {
  try {
    // console.log('bot', msg)
    const id = recipients[who] || recipients.owner;
    botCmd('sendMessage', {
      chat_id: id,
      text: msg,
    });
  } catch (err) {
    log.e('send error', err);
  }
};

function getUpdates() { // eslint-disable-line
  botCmd('getUpdates', {
    offset: -1,
  }).then(r => {
    console.log(r);
  });
}
// getUpdates();
