const winston = require('winston');

const levels = {
  e: 3,
  w: 4,
  i: 6,
  d: 7,
};

const create = name =>
  winston.createLogger({
    levels,
    level: 'i',
    format: winston.format.combine(
      winston.format.timestamp(),
      // winston.format.align(),
      winston.format.printf(info => {
        if (info.message instanceof Object) {
          return `${info.timestamp.slice(0, 19)} [${name}] [${info.level.toUpperCase()}] ${JSON.stringify(info.message, null, 2)}`;
        }
        return `${info.timestamp.slice(0, 19)} [${name}] [${info.level.toUpperCase()}] ${info.message}`;
      }),
    ),
    transports: [
      new winston.transports.Console(),
    ],
  });

module.exports = { create };
