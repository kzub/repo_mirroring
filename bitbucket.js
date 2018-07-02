const request = require('request-promise-native');
const log = require('./logger').create('BITBUCKET');
const cache = require('./cache');

const repositories = async (config) => {
  const opts = {
    auth: config.auth,
  };
  log.i(`loading bitbucket account: ${config.account}`);

  // for development use
  const cacheRes = await cache.get('repolist');
  if (cacheRes) {
    return JSON.parse(cacheRes);
  }

  let result = [];
  let link = `https://api.bitbucket.org/2.0/repositories/${config.account}/?pagelen=50`;

  while (link) {
    let bbRes = await request(link, opts);
    bbRes = JSON.parse(bbRes);
    link = bbRes && bbRes.next;
    log.i(`loaded ${bbRes.page * bbRes.pagelen}/${bbRes.size}`);
    if (bbRes.values) {
      result = result.concat(bbRes.values);
    }
  }

  // for development use
  await cache.set('repolist', JSON.stringify(result));

  return result;
};

module.exports = { repositories };
