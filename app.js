const log = require('./logger').create('MAIN');
const bitbucket = require('./bitbucket');
const github = require('./github');
const gitlab = require('./gitlab');
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

const backupAccount = async (account) => {
  let repos;
  log.i(`${account.server}/${account.login}: update repositories list`);

  if (account.server === 'bitbucket.org') {
    repos = await bitbucket.repositories(account);
  } else if (account.server === 'github.com') {
    repos = await github.repositories(account);
  } else if (account.server.includes('gitlab')) {
    repos = await gitlab.repositories(account);
  } else {
    throw new Error(`unknown git server: ${JSON.stringify(account)}`);
  }

  log.i(`${account.server}/${account.login}: found ${repos.length} repositories`);
  for (const r of repos) {
    await git.backupRepo(account.server, account.login, r.name, r.sshLink);
  }

  log.i(`${account.server}/${account.login}: ${repos.length} repositories complete`);
  return repos.length;
};

const main = async () => {
  const startTime = Date.now();
  const counters = [];
  for (const account of config.accounts) {
    const c = await backupAccount(account);
    counters.push(`${account.server}-${account.login}: ${c} repos`);
  }

  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000 / 60);
  log.i(`Git backuping done in ${duration} minutes\n${counters.join('\n')}`);
  telegram.send(`Git backuping done in ${duration} minutes\n${counters.join('\n')}`);
};

main();
