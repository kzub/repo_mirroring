const log = require('./logger').create('MAIN');
const bitbucket = require('./bitbucket');
const git = require('./git');
const config = require('./config');
const telegram = require('./telegram');

process.on('uncaughtException', (err) => {
  telegram.send(`git backup error: ${err.message}`);
  log.e(`uncaughtException: ${err.stack}`);
});

process.on('unhandledRejection', (err) => {
  telegram.send(`git backup error: ${err.message}`);
  log.e(`unhandledRejection: ${err.stack}`);
});

const backupAccount = async (accountConfig) => {
  let repos;

  if (accountConfig.server === 'bitbucket.org') {
    repos = await bitbucket.repositories(accountConfig);
  } else {
    throw new Error(`unknown git server: ${JSON.stringify(accountConfig)}`);
  }

  for (const r of repos) {
    await git.backupRepo(accountConfig.server, accountConfig.account, r.name);
  }

  return repos.length;
};

const main = async () => {
  const startTime = Date.now();
  let counter = 0;
  for (const account of config.accounts) {
    counter += await backupAccount(account);
  }

  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000 / 60);
  log.i(`Backuping done: ${counter} repos in ${duration} minutes`);
  telegram.send(`git backup OK: ${counter} repos in ${duration} minutes`);
};

main();

