const request = require('request-promise-native');
const log = require('./logger').create('GITLAB');
const cache = require('./cache');

const getNextLink = (link) => {
  // <https://api.github.com/user/11235022/repos?per_page=2&page=2>; rel="next", <https://api.github.com/user/11235022/repos?per_page=2&page=9>; rel="last"
  const parts = link.match(/(^|\W)<https?:\/\/(.*)>;\Wrel="next"/);
  if (!parts || parts.length !== 3) {
    return undefined;
  }
  const next = parts[2];
  return `https://${next}`;
};

const repositories = async (config) => {
  const opts = {
    headers: {
      'Private-Token': config.auth.token,
    },
    resolveWithFullResponse: true,
  };
  log.i(`loading ${config.server} projects`);

  // for development use
  const cacheRes = await cache.get('repolist');
  if (cacheRes) {
    return JSON.parse(cacheRes);
  }

  let result = [];
  let link = `https://${config.server}/api/v4/projects/`;

  while (link) {
    const ghRes = await request(link, opts);
    const values = JSON.parse(ghRes.body);

    if (values.length) {
      result = result.concat(values);
    }
    link = getNextLink(ghRes.headers.link);
  }

  result = result.map((d) => {
    return {
      name: `${d.namespace.path}.${d.name}`,
      sshLink: d.ssh_url_to_repo,
    };
  });

  // for development use
  await cache.set('repolist', JSON.stringify(result));

  log.i(`found ${result.length} repositories`);
  return result;
};

module.exports = { repositories };
