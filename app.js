const log = require('./logger').create('MAIN');
const bitbucket = require('./bitbucket');
const git = require('./git');
const config = require('./config');

process.on('uncaughtException', (err) => {
  log.e(`uncaughtException: ${err.stack}`);
});

process.on('unhandledRejection', (err) => {
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
};

const main = async () => {
  const startTime = Date.now();

  for (const account of config.accounts) {
    await backupAccount(account);
  }

  const endTime = Date.now();
  log.i(`Backuping done in ${Math.round((endTime - startTime) / 1000 / 60)} minutes`);
};

main();

