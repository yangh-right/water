export function safeEval(code) {
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; ${code}`)();
}

// 解析函数字符串值
export const evaluateString = (string, formData, rootValue) =>
  safeEval(`
  var rootValue =${JSON.stringify(rootValue)};
  var formData = ${JSON.stringify(formData)};
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

// 深拷贝对象
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
