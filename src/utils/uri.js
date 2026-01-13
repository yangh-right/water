/* eslint-disable no-param-reassign */
export function decode(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {}
  return str;
}

export function parsePath(path) {
  let hash = '';
  let query = '';

  const hashIndex = path.indexOf('#');
  if (hashIndex >= 0) {
    hash = path.slice(hashIndex);
    path = path.slice(0, hashIndex);
  }

  const queryIndex = path.indexOf('?');
  if (queryIndex >= 0) {
    query = path.slice(queryIndex + 1);
    path = path.slice(0, queryIndex);
  }

  return {
    path,
    query,
    hash
  };
}

export function parseQuery(query) {
  const res = {};

  query = query.trim().replace(/^(\?|#|&)/, '');

  if (!query) {
    return res;
  }

  query.split('&').forEach(param => {
    const parts = param.replace(/\+/g, ' ').split('=');
    const key = decode(parts.shift());
    const val = parts.length > 0 ? decode(parts.join('=')) : null;

    if (res[key] === undefined) {
      res[key] = val;
    } else if (Array.isArray(res[key])) {
      res[key].push(val);
    } else {
      res[key] = [res[key], val];
    }
  });

  return res;
}

// eslint-disable-next-line max-params
export function convertUrl(url, mode, host, pathname) {
  mode = (mode || '').toLowerCase();

  // 移除连续斜线，比如，http://localhost/upload/file/201205//maincus.swf
  // base64 data 除外
  if (url.substr(0, 5) !== 'data:') {
    url = url.replace(/([^:])\/\//g, '$1/');
  }
  if (url.substr(0, 4) === 'http') {
    return url;
  }
  if (!['absolute', 'relative', 'domain'].includes(mode)) {
    return url;
  }
  host = host || location.protocol + '//' + location.host;
  if (pathname === undefined) {
    let m = location.pathname.match(/^(\/.*)\//);
    pathname = m ? m[1] : '';
  }
  let match;
  if ((match = /^(\w+:\/\/[^\/]*)/.exec(url))) {
    if (match[1] !== host) {
      return url;
    }
  } else if (/^\w+:/.test(url)) {
    return url;
  }
  function getRealPath(path) {
    let parts = path.split('/');
    let paths = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      let part = parts[i];
      if (part === '..') {
        if (paths.length > 0) {
          paths.pop();
        }
      } else if (part !== '' && part !== '.') {
        paths.push(part);
      }
    }
    return '/' + paths.join('/');
  }
  if (/^\//.test(url)) {
    url = host + getRealPath(url.substr(1));
  } else if (!/^\w+:\/\//.test(url)) {
    url = host + getRealPath(pathname + '/' + url);
  }

  function getRelativePath(path, depth) {
    if (url.substr(0, path.length) === path) {
      let arr = [];
      for (let i = 0; i < depth; i++) {
        arr.push('..');
      }
      let prefix = '.';
      if (arr.length > 0) {
        prefix += '/' + arr.join('/');
      }
      if (pathname === '/') {
        prefix += '/';
      }
      return prefix + url.substr(path.length);
    } else {
      if ((match = /^(.*)\//.exec(path))) {
        return getRelativePath(match[1], ++depth);
      }
    }
  }

  if (mode === 'relative') {
    url = getRelativePath(host + pathname, 0).substr(2);
  } else if (mode === 'absolute') {
    if (url.substr(0, host.length) === host) {
      url = url.substr(host.length);
    }
  }

  return url;
}
