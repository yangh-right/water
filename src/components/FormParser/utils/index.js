export function deepClone(obj) {
  const _toString = Object.prototype.toString;

  // null, undefined, non-object, function
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // DOM Node
  if (obj.nodeType && 'cloneNode' in obj) {
    return obj.cloneNode(true);
  }

  // Date
  if (_toString.call(obj) === '[object Date]') {
    return new Date(obj.getTime());
  }

  // RegExp
  if (_toString.call(obj) === '[object RegExp]') {
    const flags = [];
    if (obj.global) {
      flags.push('g');
    }
    if (obj.multiline) {
      flags.push('m');
    }
    if (obj.ignoreCase) {
      flags.push('i');
    }

    return new RegExp(obj.source, flags.join(''));
  }

  const result = Array.isArray(obj) ? [] : obj.constructor ? new obj.constructor() : {};

  for (const key in obj) {
    result[key] = deepClone(obj[key]);
  }

  return result;
}

// 克隆对象
export function clone(data) {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (e) {
    return data;
  }
}

// Remove all window valid api
// For safety jest-* variable will throw error
export function safeEval(code) {
  let safeContextStr = '';
  if (typeof window !== 'undefined') {
    const windowContextAttr = Object.getOwnPropertyNames(window).filter(isValidVariableName);
    for (let i = 0, len = windowContextAttr.length; i < len; i++) {
      safeContextStr += `var ${windowContextAttr[i]} = undefined;`;
    }
  }
  return Function(`${safeContextStr} "use strict";  ${code}`)();
}
// 代替eval的函数
export const parseString = string => safeEval(`return (${string})`);

// 解析函数字符串值
export const evaluateString = (string, formData, rootValue) =>
  safeEval(`
  const rootValue =${JSON.stringify(rootValue)};
  const formData = ${JSON.stringify(formData)};
  return (${string})
  `);

// 判断schema的值是是否是“函数”
// JSON无法使用函数值的参数，所以使用"{{...}}"来标记为函数，也可使用@标记，不推荐。
export function isFunction(func) {
  if (typeof func === 'function') {
    return true;
  }
  if (typeof func === 'string' && func.substring(0, 1) === '@') {
    return func.substring(1);
  }
  if (
    typeof func === 'string' &&
    func.substring(0, 2) === '{{' &&
    func.substring(func.length - 2, func.length) === '}}'
  ) {
    return func.substring(2, func.length - 2);
  }
  return false;
}

// 判断schema中是否有属性值是函数表达式
// TODO: 这个util，没有考虑schema是array的情况，不过目前没有被用到
export function isFunctionSchema(schema) {
  return Object.keys(schema).some(key => {
    if (typeof schema[key] === 'function') {
      return true;
    } else if (typeof schema[key] === 'string') {
      return isFunction(schema[key]);
    } else if (typeof schema[key] === 'object') {
      return isFunctionSchema(schema[key]);
    } else {
      return false;
    }
  });
}

export const isObj = a => stringContains(Object.prototype.toString.call(a), 'Object');

// 函数表达式转换成值
export const convertValue = (item, formData, rootValue) => {
  if (typeof item === 'function') {
    return item(formData, rootValue);
  } else if (typeof item === 'string' && isFunction(item) !== false) {
    const _item = isFunction(item);
    try {
      return evaluateString(_item, formData, rootValue);
    } catch (error) {
      console.error(error.message);
      console.error(`happen at ${item}`);
      return item;
    }
  }
  return item;
};

export function baseGet(object, path) {
  path = castPath(path, object);

  let index = 0;
  const length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return index && index == length ? object : undefined;
}

function castPath(value, object) {
  if (Array.isArray(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : value.match(/([^\.\[\]"']+)/g);
}

function toKey(value) {
  if (typeof value === 'string') {
    return value;
  }
  const result = `${value}`;
  return result == '0' && 1 / value == -INFINITY ? '-0' : result;
}

const reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
const reIsPlainProp = /^\w*$/;

function isKey(value, object) {
  if (Array.isArray(value)) {
    return false;
  }
  const type = typeof value;
  if (type === 'number' || type === 'boolean' || value == null) {
    return true;
  }
  return (
    reIsPlainProp.test(value) ||
    !reIsDeepProp.test(value) ||
    (object != null && value in Object(object))
  );
}

export function funcfySchema(schema) {
  let _schema = clone(schema);
  if (isObj(_schema)) {
    Object.keys(_schema).forEach(key => {
      _schema[key] = funcfySchema(_schema[key]);
    });
  } else if (Array.isArray(_schema)) {
    _schema = _schema.map(item => funcfySchema(item));
  } else {
    const funcBody = isFunction(schema);
    if (typeof funcBody === 'string') {
      try {
        _schema = new Function('formData', 'rootValue', `return ${funcBody}`);
      } catch (error) {
        console.error('funcfySchema', error);
      }
    }
  }
  return _schema;
}

export function ajax(config, options = {}, $axios) {
  let { url, method } = config;

  let ajax = $axios;

  let params = {
    method,
    url,
    params: {
      t: new Date().getTime()
    },
    ...options
  };

  if ($axios) {
    return ajax(params);
  }

  return ajax(params).then(res => res.data);
}
