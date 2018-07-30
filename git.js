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
      if (code === 1) { // empty repo
        resolv(code);
        return;
      }
      if (code !== 0) {
        reject(new Error(`return error code: ${code}`));
        return;
      }
      resolv(code);
    });
  });

const getDestinationDir = (server, account, repo) => {
  if (account) {
    return `./repos/${server}-${account}/${repo}`;
  }
  return `./repos/${server}/${repo}`;
};

const getGitLink = (server, account, repo, sshLink) => {
  if (sshLink) {
    return sshLink;
  }
  return `git@${server}:${account}/${repo}.git`;
};

const cloneRepo = async (server, account, repo, sshLink) => {
  const link = getGitLink(server, account, repo, sshLink);
  const dest = getDestinationDir(server, account, repo);
  log.i(`Cloning ${link} -> ${dest}`);
  const exitCode = await runProgram('git', ['clone', link, dest]);
  if (exitCode !== 0) {
    log.e(`Error cloning ${dest}, return code: ${exitCode}`);
  }
};

const updateRepo = async (server, account, repo, sshLink) => {
  const link = getGitLink(server, account, repo, sshLink);
  const cwd = getDestinationDir(server, account, repo);

  log.i(`Fetching ${link} -> ${cwd}`);
  let exitCode = await runProgram('git', ['fetch'], cwd);
  if (exitCode !== 0) {
    log.e(`Error fetching ${cwd}, return code: ${exitCode}`);
  }

  log.i(`Pulling ${cwd}`);
  exitCode = await runProgram('git', ['pull'], cwd);
  if (exitCode !== 0) {
    log.e(`Error pulling ${cwd}, return code: ${exitCode}`);
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

const backupRepo = async (server, account, repo, sshLink) => {
  const dest = getDestinationDir(server, account, repo);
  log.i('--------------------------------------------------------------------------------------');
  log.i(`Backuping ${dest}`);
  if (!(await exist(dest))) {
    await cloneRepo(server, account, repo, sshLink);
  } else {
    await updateRepo(server, account, repo, sshLink);
  }
  log.i(`Complete ${dest}`);
};

module.exports = {
  backupRepo,
};
