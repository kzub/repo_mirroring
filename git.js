const log = require('./logger').create('BITBUCKET');
const fs = require('fs');
const { spawn } = require('child_process');
const { promisify } = require('util');

const access = promisify(fs.access);

const runProgram = async (cmd, args, cwd) =>
  new Promise((resolv, reject) => {
    let data = ''; // eslint-disable-line no-unused-vars
    const proc = spawn(cmd, args, {
      cwd,
      detached: true,
    });

    proc.stdout.on('data', (chunk) => {
      console.log(chunk.toString().split('\n').map(e => `  ${e}`).join('\n'));
      data += chunk;
    });

    proc.stderr.on('data', (chunk) => {
      console.log(chunk.toString().split('\n').map(e => `  ${e}`).join('\n'));
      data += chunk;
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`return code: ${code}`));
        return;
      }
      resolv(code);
    });
  });

const cloneRepo = async (server, account, repo) => {
  const link = `git@${server}:${account}/${repo}.git`;
  const dest = `./repos/${server}-${account}/${repo}`;
  log.i(`Cloning ${dest}`);
  const exitCode = await runProgram('git', ['clone', link, dest]);
  if (exitCode !== 0) {
    log.e(`Error cloning ${dest}`);
  }
};

const updateRepo = async (server, account, repo) => {
  const cwd = `./repos/${server}-${account}/${repo}`;

  log.i(`Fetching ${cwd}`);
  let exitCode = await runProgram('git', ['fetch'], cwd);
  if (exitCode !== 0) {
    log.e(`Error fetching ${cwd}`);
  }

  log.i(`Pulling ${cwd}`);
  exitCode = await runProgram('git', ['pull'], cwd);
  if (exitCode !== 0) {
    log.e(`Error pulling ${cwd}`);
  }
};

const exist = async (fname) => {
  try {
    await access(fname);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
    log.e(`exist(): ${err.code}`);
    throw err;
  }
  return true;
};

const backupRepo = async (server, account, repo) => {
  const dest = `./repos/${server}-${account}/${repo}`;
  log.i('--------------------------------------------------------------------------------------');
  log.i(`Backuping ${dest}`);
  if (!(await exist(dest))) {
    await cloneRepo(server, account, repo);
  } else {
    await updateRepo(server, account, repo);
  }
  log.i(`Complete ${dest}`);
};

module.exports = {
  backupRepo,
};
