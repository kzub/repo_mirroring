const request = require('async-request');
const config = require('./config.js');

const botURL = `https://api.telegram.org/bot${config.telegram.token}/`;
const recipients = {
  owner: config.telegram.owner,
};

async function botCmd(method, params) {
  const url = botURL + method;
  const opts = {
    method: 'POST',
    data: params,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  console.log(url, opts);
  return request(url, opts);
}

exports.send = async (msg, who) => {
  // console.log('bot', msg)
  const id = recipients[who] || recipients.owner;
  return botCmd('sendMessage', {
    chat_id: id,
    text: msg,
  });
};

function getUpdates() { // eslint-disable-line
  botCmd('getUpdates', {
    offset: -1,
  }).then(r => {
    console.log(r);
  });
}
// getUpdates();
