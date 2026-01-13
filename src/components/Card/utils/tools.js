import Vue from 'vue';

// 结果解析
export function resultParse(res) {
  if (res.data && res.data.status === 'complete') {
    return res.data.resultData;
  } else {
    Vue.prototype.$message.error((res && res.data && res.data.errorMessage) || '接口异常');
    return Promise.reject(res.data);
  }
}

// 树结构转换
export function treeTransform(tree, treeMap) {
  let _tree = [];
  let _treeMap = treeMap || {
    id: 'id',
    label: 'name',
    value: 'id'
  };
  if (tree && tree.length) {
    tree.forEach(v => {
      let _tmp = Object.entries(_treeMap).reduce((a, b) => {
        a[b[0]] = v[b[1]];
        return a;
      }, {});
      _tree.push({ ...v, ..._tmp, children: treeTransform(v.children, _treeMap) });
    });
  }
  return _tree;
}

// 深拷贝
export function deepCopy(target) {
  // 缓存数组
  let _cache = [];

  function _deepCopy(_target) {
    // 过滤非对象类型和null
    if (typeof _target !== 'object' || !_target) { return _target; }
    // 检查缓存，处理循环引用和相同引用
    for (let _i = 0, _len = _cache.length; _i < _len; _i++) {
      if (_target === _cache[_i].target) {
        return _cache[_i].copyTarget;
      }
    }
    // 分类处理
    let _res = null;
    switch (Object.prototype.toString.call(_target)) {
      case '[object Array]':
        // 数组
        _res = [];
        _addCache(_target, _res);
        _target.forEach(_v => {
          _res.push(_deepCopy(_v));
        });
        break;
      case '[object Object]':
        // 对象
        _res = {};
        _addCache(_target, _res);
        Object.keys(_target).forEach(_k => {
          _res[_k] = _deepCopy(_target[_k]);
        });
        break;
      case '[object Date]':
        // 日期
        _res = new Date(_target.valueOf());
        _addCache(_target, _res);
        break;
      case '[object RegExp]':
        // 正则
        // eslint-disable-next-line no-case-declarations
        let _pattern = _target.valueOf();
        // eslint-disable-next-line no-case-declarations
        let _attributes = '';
        _attributes += _pattern.global ? 'g' : '';
        _attributes += _pattern.ignoreCase ? 'i' : '';
        _attributes += _pattern.multiline ? 'm' : '';
        _res = new RegExp(_pattern.source, _attributes);
        _addCache(_target, _res);
        break;
      case '[object Error]':
        // 报错
        _res = _target;
        _addCache(_target, _res);
        break;
      case '[object Map]':
        // Map
        _res = new Map();
        _addCache(_target, _res);
        _target.forEach((_v, _k) => {
          _res.set(_deepCopy(_k), _deepCopy(_v));
        });
        break;
    }
    return _res;
  }

  function _addCache(_target, _copyTarget) {
    _cache.push({ target: _target, copyTarget: _copyTarget });
  }

  return _deepCopy(target);
}

// 对象合并
export function mergeObject(srcObj, distObj) {
  const toSting = Object.prototype.toString;

  if (toSting.call(srcObj) !== '[object Object]' || toSting.call(distObj) !== '[object Object]') {
    throw new Error('mergeObject: Arguments must be of type object');
  }

  let obj = deepCopy(srcObj);

  function merge(obj, target) {
    if (target !== null) {
      for (let key in target) {
        if (target.hasOwnProperty(key)) {
          if (obj[key] && toSting.call(obj[key]) === toSting.call(target[key]) && typeof obj[key] === 'object') {
            merge(obj[key], target[key]);
          } else {
            obj[key] = deepCopy(target[key]);
          }
        }
      }
    }
    return obj;
  }

  return merge(obj, distObj);
}

// 文件导出
export function exportFile(data, filename, ext = 'xls') {
  let blob = new Blob([data]);
  if (window.navigator.msSaveBlob) {
    try {
      // ie浏览器自带下载文件的方法
      window.navigator.msSaveBlob(data, filename);
    } catch (e) {
      // console.log(e);
    }
  } else {
    let elink = document.createElement('a');
    elink.download = `${filename}.${ext}`;
    elink.style.display = 'none';

    let href = window.URL.createObjectURL(blob);
    elink.href = href;

    document.body.appendChild(elink);
    elink.click();

    document.body.removeChild(elink);
    window.URL.revokeObjectURL(href); // 释放掉blob对象
  }
}

// 防抖
export function debounce(fn, wait) {
  let timeout;
  return function(...args) {
    timeout && clearTimeout(timeout);
    timeout = setTimeout(() => {
      // eslint-disable-next-line no-invalid-this
      fn.apply(this, args);
    }, wait);
  };
}
