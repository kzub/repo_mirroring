const request = require('request-promise-native');
const config = require('./config.js');
const SocksAgent = require('socks5-https-client/lib/Agent');
const log = require('./logger').create('TELEGRAMM');

const botURL = `https://api.telegram.org/bot${config.telegram.token}/`;
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
    agentClass: SocksAgent,
    agentOptions: {
      socksHost: config.socks5.host,
      socksPort: config.socks5.port,
      socksUsername: config.socks5.user,
      socksPassword: config.socks5.password,
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
