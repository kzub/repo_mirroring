const Redis = require('ioredis');
const log = require('./logger').create('CACHE');

const cacheEnabled = true;
let redis;
if (cacheEnabled) {
  log.i('CACHE cacheEnabled');
  redis = new Redis();
}

exports.get = async (key) => {
  if (!cacheEnabled) {
    return undefined;
  }
  const cache = await redis.get(key);
  if (cache) {
    log.i(`get from cache ${key}`);
    return cache;
  }
  return undefined;
};

exports.set = async (key, value) => {
  if (!cacheEnabled) {
    return undefined;
  }
  console.log(`set cache ${key}`);
  return redis.setex(key, 10 * 60, value);
};
