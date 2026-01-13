/* eslint-disable max-params */
import store from '@/store';
import enquireJs from 'enquire.js';
import serverConfig from '@/config/server.config';
import coordtransform from 'coordtransform';
import moment from 'moment';
import { isArray, isFunction } from 'lodash-es';

const _toString = Object.prototype.toString;

export function isDef(v) {
  return v !== undefined && v !== null;
}
/**
 * @description: 设置表单项options属性（主要用于异步填充，如下拉框选项等）
 * @param {*} formOptions
 * @param {*} id
 * @param {*} options
 * @return {*}
 */
export function setFormItemOptions(formOptions, id, options) {
  updateFormOptions(formOptions, 'id', id, { options });
}
/**
 * @description: 获取时间的简写格式
 * @param {*} list
 * @return {*}
 */
export function getShortDateStr(list) {
  if (!Array.isArray(list) || list?.length < 2) return list;
  const dateList = [...list];
  const startDate = dateList[0];
  const endDate = dateList[dateList.length - 1];
  let dateFormat = 'YYYY-MM-DD HH:mm';
  if (!moment(startDate).isSame(endDate, 'year')) {
    dateFormat = 'YYYY-MM-DD HH:mm';
  } else if (!moment(startDate).isSame(endDate, 'month')) {
    dateFormat = 'MM-DD HH:mm';
  } else if (!moment(startDate).isSame(endDate, 'day')) {
    dateFormat = 'DD HH:mm';
  } else {
    dateFormat = 'HH:mm';
  }
  return dateList.map(item => {
    return moment(item).format(dateFormat);
  });
}
/**
 * @description: 多值过滤
 * @param {*} value
 * @param {*} dict
 * @return {*}
 */
export function multipleValueFilter(value, dict) {
  const arr = value?.split(',') ?? [];
  return arr.map(v => singleValueFilter(v, dict)).join();
}
/**
 * @description: 结果解析
 * @param {*} res
 * @param {*} full
 * @return {*}
 */
export function resultParser(res) {
  const { status, resultData } = res ?? {};
  if (status === 'complete') {
    return Promise.resolve(resultData);
  }
  return Promise.reject(res);
}
export function updateFormOptions1(formOptions, formKey, params) {
  if (!formOptions || !formOptions[formKey]) return;

  const ctx = formOptions[formKey];
  let _params = params;

  if (!Array.isArray(_params)) {
    _params = [params];
  }

  _params.forEach(({ fieldKey, fieldValue, replaceAttrs }) => {
    const idx = ctx.findIndex(item => item[fieldKey] === fieldValue);
    if (idx > -1) {
      let item = { ...ctx[idx] };
      Object.entries(replaceAttrs).forEach(([key, value]) => {
        item[key] = value;
      });
      ctx.splice(idx, 1, item);
    }
  });
}
/**
 * @description: 更新表单项配置
 * @param {*} formOptions
 * @param {*} fieldKey
 * @param {*} fieldValue
 * @param {*} attrs
 * @return {*}
 */
export function updateFormOptions(formOptions, fieldKey, fieldValue, attrs) {
  const idx = formOptions?.list?.findIndex(item => item[fieldKey] === fieldValue);
  if (idx > -1) {
    let item = { ...formOptions.list[idx] };
    Object.entries(attrs).forEach(([key, value]) => {
      item[key] = value;
    });
    formOptions.list.splice(idx, 1, item);
  }
}
/**
 * Remove an item from an array.
 */
export function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}

export function isRegExp(v) {
  return _toString.call(v) === '[object RegExp]';
}

export function getColor(colorList, i) {
  if (i < colorList.length) {
    return colorList[i];
  }
  return 'rgb(' + ((i * 80) % 255) + ',' + ((i * 100) % 255) + ',' + ((i * 60) % 255) + ')';
}
export function enquireScreen(call) {
  const handler = {
    match: function() {
      call && call(true);
    },
    unmatch: function() {
      call && call(false);
    }
  };
  enquireJs.register('only screen and (max-width: 767.99px)', handler);
}

export function exportFile(
  data,
  filename,
  ext = 'xlsx',
  mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
) {
  if (data instanceof Blob) {
    let blob = new Blob([data], { type: mime });
    if (window.navigator.msSaveBlob) {
      try {
        // ie浏览器自带下载文件的方法
        window.navigator.msSaveBlob(data, filename);
      } catch (e) {}
    } else {
      let elink = document.createElement('a');
      elink.download = filename + '.' + ext;
      elink.style.display = 'none';
      let href = window.URL.createObjectURL(blob);
      elink.href = href;
      document.body.appendChild(elink);
      elink.click();

      setTimeout(() => {
        document.body.removeChild(elink);
        window.URL.revokeObjectURL(href); // 释放掉blob对象
      }, 200);
    }
  }
}
export function base64ToBlob(code) {
  var arr = code.split(',');
  var mime = arr[0].match(/:(.*?);/)[1];
  var bstr = window.atob(arr[1]);
  var n = bstr.length;
  var u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export function exportUrlFile(url, filename) {
  getBlob(url, function(blob) {
    saveAs(blob, filename);
  });
}
export function getBlob(url, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';
  xhr.onload = function() {
    if (xhr.status === 200) {
      cb(xhr.response);
    }
  };
  xhr.send();
}
// 保存
// @param  {Blob} blob
// @param  {String} filename 想要保存的文件名称
function saveAs(blob, filename) {
  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement('a');
    var body = document.querySelector('body');

    link.href = window.URL.createObjectURL(blob);
    link.download = filename;

    // fix Firefox
    link.style.display = 'none';
    body.appendChild(link);

    link.click();
    body.removeChild(link);

    window.URL.revokeObjectURL(link.href);
  }
}
export function getDicName(dicList, text, name = 'name') {
  return dicList.length
    ? dicList.find(item => {
        return item.value + '' === text + '' || item.code + '' === text + '';
      })?.[name] || ''
    : '';
}
export function setTree(list, flag = false) {
  list.forEach(_i => {
    if (_i?.children?.length) {
      _i.selectable = _i.checkable;
      if (flag) {
        // 设置唯一 key
        _i.key = `${_i.parentId}-${_i.id}`;
        _i.id = _i.key;
      }
      setTree(_i.children, flag);
    }
    _i.selectable = _i.checkable;
    if (flag) {
      _i.key = `${_i.parentId}-${_i.id}`;
      _i.id = _i.key;
    }
  });
}
export function printFile(data, filename, ext = 'pdf', mime = 'application/pdf;charset=UTF-8') {
  if (data instanceof Blob) {
    let blob = new Blob([data], { type: mime });
    if (window.navigator.msSaveBlob) {
      try {
        // ie浏览器自带下载文件的方法
        window.navigator.msSaveBlob(data, filename);
      } catch (e) {}
    } else {
      let pdfUrl = window.URL.createObjectURL(blob);
      let date = new Date().getTime();
      let ifr = document.createElement('iframe');
      ifr.style.frameborder = 'no';
      ifr.style.display = 'none';
      ifr.style.pageBreakBefore = 'always';
      ifr.setAttribute('id', 'printPdf' + date);
      ifr.setAttribute('name', filename);
      ifr.src = pdfUrl;
      document.body.appendChild(ifr);

      // 打印文件
      let ordonnance = ifr.contentWindow;
      setTimeout(() => {
        ordonnance.print();
      }, 100);

      window.URL.revokeObjectURL(ifr.src); // 释放URL 对象
    }
  }
}

/**
 * 获取本地保存的配置
 * @param load {boolean} 是否加载配置中的主题
 * @returns {Object}
 */
export function getLocalSetting(loadTheme) {
  let localSetting = {};
  try {
    const localSettingStr = localStorage.getItem(process.env.VUE_APP_SETTING_KEY);
    localSetting = JSON.parse(localSettingStr);
  } catch (e) {
    console.error(e);
  }

  return localSetting;
}

/**
 * 格式化 router.options.routes，生成 fullPath
 * @param routes
 * @param parentPath
 */
export function formatFullPath(routes, parentPath = '') {
  routes.forEach(route => {
    let isFullPath = route.path.substring(0, 1) === '/';
    route.fullPath = isFullPath
      ? route.path
      : parentPath === '/'
      ? parentPath + route.path
      : parentPath + '/' + route.path;
    if (route.children) {
      formatFullPath(route.children, route.fullPath);
    }
  });
}

/**
 * url参数序列化方法
 * @param obj
 * @param type
 * @returns {string}
 */
export function serialize(obj = {}, type = '?') {
  let ary = [];
  for (let p in obj) {
    if (obj.hasOwnProperty(p) && obj[p]) {
      if (type === '/') {
        ary.push(encodeURIComponent(obj[p]));
      } else {
        ary.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
      }
    }
  }

  return type + ary.join(type === '/' ? type : '&');
}

// 服务器图片完整链接
export function imageFullUrl(url) {
  return url && !/http/.test(url) ? 'http://119.3.37.131' + url : url;
}

export function ellipsis(item, max) {
  return item ? (item.length > max ? item.substring(0, max) + '...' : item) : '--';
}

/**
 * 合并对象
 * @param FirstOBJ
 * @param SecondOBJ
 * @returns {*}
 */
export const deepObjectMerge = (FirstOBJ, SecondOBJ) => {
  for (let key in SecondOBJ) {
    FirstOBJ[key] =
      FirstOBJ[key] && FirstOBJ[key].toString() === '[object Object]'
        ? deepObjectMerge(FirstOBJ[key], SecondOBJ[key])
        : (FirstOBJ[key] = SecondOBJ[key]);
  }
  return FirstOBJ;
};
/**
 * 坐标系转换（bd09、wgs84、gcj02）
 * @param coordinate 原经纬度坐标
 * @param originType 原坐标系类型
 * @param targetType 目标坐标系类型
 * @returns {*}
 */
export const coordTransform = (coordinate, originType, targetType) => {
  const { bd09togcj02, gcj02tobd09, wgs84togcj02, gcj02towgs84 } = coordtransform;
  const key = (originType + 'to' + targetType).toLocaleLowerCase();
  let targetCoord = [...coordinate];
  for (const item of targetCoord) {
    if ((!item && typeof item !== 'number') || isNaN(item)) {
      return targetCoord;
    }
  }
  switch (key) {
    case 'bd09togcj02':
      targetCoord = bd09togcj02(...coordinate);
      break;
    case 'bd09towgs84':
      targetCoord = gcj02towgs84(...bd09togcj02(...coordinate));
      break;
    case 'gcj02tobd09':
      targetCoord = gcj02tobd09(...coordinate);
      break;
    case 'gcj02towgs84':
      targetCoord = gcj02towgs84(...coordinate);
      break;
    case 'wgs84togcj02':
      targetCoord = wgs84togcj02(...coordinate);
      break;
    case 'wgs84tobd09':
      targetCoord = gcj02tobd09(...wgs84togcj02(...coordinate));
      break;
    default:
      break;
  }
  return targetCoord;
};

export function arrToJson(data) {
  if (!data) return {};

  return data.reduce((prev, current) => {
    prev[current.code] = current.name;
    return prev;
  }, {});
}

export function formatTimeText(minutes) {
  let time = minutes * 60;
  let day = Math.floor((time / 86400) % 30) || 0;
  let hour = Math.floor(time / 3600) % 24 || 0;
  let min = Math.floor(time / 60) % 60 || 0;

  day = day ? `${day}天` : '';
  hour = hour ? `${hour}小时` : '';
  min = min ? `${min}分钟` : '';

  return `${day}${hour}${min}`;
}

// 树结构转换
export function treeTransform(tree) {
  let _tree = [];
  if (tree && tree.length) {
    tree.forEach(v =>
      _tree.push({
        type: v.type,
        uuid: v.uuid,
        value: v.uuid,
        title: v.name,
        key: v.uuid,
        id: v.id,
        label: v.name,
        children: treeTransform(v.children),
        disabled: v.type != null ? true : false
      })
    );
  }
  return _tree;
}

//获取文字宽高
export function computeFontSize(str, size, family) {
  size = size || '12px';
  family =
    family ||
    `-apple-system, PingFangSC-Regular, Hiragino Sans GB,
    Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif,
    Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol`;
  let spanDom = document.createElement('span');
  spanDom.style.fontSize = size;
  spanDom.style.opacity = '0';
  spanDom.style.fontFamily = family;
  spanDom.innerHTML = str;
  document.body.append(spanDom);
  let sizeD = {};
  sizeD.width = spanDom.offsetWidth;
  sizeD.height = spanDom.offsetHeight;
  spanDom.remove();
  return sizeD;
}

export function transLabel(data) {
  if (!data) return {};

  return data.reduce((prev, current) => {
    prev[current.label] = current.code;
    return prev;
  }, {});
}

export function detectIE() {
  let ua = window.navigator.userAgent;

  // Test values; Uncomment to check result …

  // IE 10
  // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

  // IE 11
  // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

  // Edge 12 (Spartan)
  // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko)
  // Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

  // Edge 13
  // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)
  // Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

  let msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  let trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    let rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  let edge = ua.indexOf('Edge/');
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
  }

  // other browser
  return false;
}

export function getToPathMsg(data, _path, arrName = [], arrId = [], isPrentNode = true) {
  let obj = {};
  let rObj = {};
  if (data.length > 0) {
    data.forEach(item => {
      if (isPrentNode) {
        arrName = [];
        arrId = [];
      }
      if (item.children && item.fullPath != _path && arrName.length <= 0) {
        obj = getToPathMsg(item.children, _path, arrName, arrId, false);
        if (obj.arrName && obj.arrName.length > 0) {
          arrName.unshift(item.meta.title);
          arrId.unshift(item.name);
          rObj = JSON.parse(JSON.stringify(obj));
        }
      } else {
        if (item.fullPath === _path && !item.meta.hidden) {
          arrName.push(item.meta.title);
          arrId.push(item.name);
        }
        obj = { arrName, arrId };
      }
    });
  }
  if (rObj.arrName && isPrentNode) {
    return rObj;
  } else {
    return obj;
  }
}
export function dictListToOptions(list) {
  return list.map(v => ({ label: v.name, value: v.value }));
}

/**
 * 获取多选下拉组件返回的监测量列表
 * @param list
 * @returns {any[]}
 */
export function getMulSctPointList(list) {
  const _list = list.reduce((a, b) => {
    a = a.concat(b.checkedList);
    return a;
  }, []);
  return [...new Set(_list)];
}

/**
 * 展平菜单
 * @param arr
 * @returns {*}
 */
export function flattenMenus(menus, prefix = '') {
  let _menus = [];
  if (menus && menus.length) {
    menus.forEach(menu => {
      let _path = prefix;
      if (menu.path) {
        if (/^\//.test(menu.path)) {
          _path = menu.path;
        } else {
          _path += '/' + menu.path;
        }
      }
      _menus.push({
        ...menu,
        children: []
      });
      if (menu.children && menu.children.length) {
        _menus = _menus.concat(flattenMenus(menu.children, _path));
      }
    });
  }
  return _menus;
}

export function createDefer(fn) {
  let _resolve;
  let _reject;
  const p = new Promise((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
    fn && fn(resolve, reject);
  });
  p.resolve = _resolve;
  p.reject = _reject;
  return p;
}

export function isInIframe() {
  if (store.state.setting.isIFrame) {
    if (window.parent !== window) {
      return true;
    }
  }
}

/**
 * 生成随机数字 [start, end)
 * @param {Number} start
 * @param {Number} end
 */
export function randomNumber(start, end) {
  return Math.floor(Math.random() * (end - start) + start);
}

//hsl转rgb
export function hslToRgb(h, s, l) {
  h = h / 360;
  s = s / 100;
  l = l / 100;
  var rgb = [];

  if (s == 0) {
    rgb = [Math.round(l * 255), Math.round(l * 255), Math.round(l * 255)];
  } else {
    var q = l >= 0.5 ? l + s - l * s : l * (1 + s);
    var p = 2 * l - q;
    rgb[0] = h + 1 / 3;
    rgb[1] = h;
    rgb[2] = h - 1 / 3;
    for (var i = 0; i < rgb.length; i++) {
      var tc = rgb[i];
      if (tc < 0) {
        tc = tc + 1;
      } else if (tc > 1) {
        tc = tc - 1;
      }
      switch (true) {
        case tc < 1 / 6:
          tc = p + (q - p) * 6 * tc;
          break;
        case 1 / 6 <= tc && tc < 0.5:
          tc = q;
          break;
        case 0.5 <= tc && tc < 2 / 3:
          tc = p + (q - p) * (4 - 6 * tc);
          break;
        default:
          tc = p;
          break;
      }
      rgb[i] = Math.round(tc * 255);
    }
  }
  return rgb;
}
//rgb转hsl
export function rgbToHsl(r, g, b) {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  var min = Math.min(r, g, b);
  var max = Math.max(r, g, b);
  var l = (min + max) / 2;
  var difference = max - min;
  var h, s;
  if (max == min) {
    h = 0;
    s = 0;
  } else {
    s = l > 0.5 ? difference / (2.0 - max - min) : difference / (max + min);
    switch (max) {
      case r:
        h = (g - b) / difference + (g < b ? 6 : 0);
        break;
      case g:
        h = 2.0 + (b - r) / difference;
        break;
      case b:
        h = 4.0 + (r - g) / difference;
        break;
    }
    h = Math.round(h * 60);
  }
  s = Math.round(s * 100); //转换成百分比的形式
  l = Math.round(l * 100);
  return [h, s, l];
}

/**
 * @description: 通过菜单编码获取路由数据
 * @param {*} code
 * @return {*}
 */
export function getRouterByCode(code) {
  const { addRouters } = store.state.setting;
  let router = null;
  const cb = node => {
    if (code && node.meta?.code === code) {
      router = node;
      return false;
    }
  };
  traversalTree(addRouters, cb);
  return router;
}
/**
 * @description: 遍历树
 * @param {*} tree
 * @param {*} cb
 * @param {*} props
 * @param {*} level
 * @return {*}
 */
export function traversalTree(tree, cb, { props, level = 1 } = {}) {
  const _props = { children: 'children', ...props };

  if (isArray(tree)) {
    for (let node of tree) {
      const isLeaf = !node[_props.children] || node[_props.children].length === 0;
      if (isFunction(cb)) {
        const res = cb(node, { isLeaf, props: _props, level });
        // 停止当前遍历
        if (res === false) {
          return false;
        }
      }
      if (!isLeaf) {
        const res = traversalTree(node[_props.children], cb, { props, level: level + 1 });
        // 停止后续遍历
        if (!res) {
          return false;
        }
      }
    }
  }
  return true;
}
/**
 * 格式化树
 * @param tree 源树数据
 * @param mapping 字段映射表，格式如：{id: 'id',name: 'data.name',list: {attr: 'currentList', mapping: {...}},children: {attr: 'childNodes', isChildren: true}}
 * @returns {{}}
 */
export function treeFormat(tree, mapping) {
  const isObject = val => Object.prototype.toString.call(val) === '[object Object]';
  const isArray = val => Object.prototype.toString.call(val) === '[object Array]';
  const formatter = function(item, mapping) {
    let _item = {};
    if (isObject(mapping)) {
      // 配置了映射表，按映射表映射
      Object.entries(mapping).forEach(([key, value]) => {
        if (isObject(value)) {
          // 对象，新增对象或子项迭代或子项属性映射
          if (value._raw) {
            let _mapping = { ...value };
            Reflect.deleteProperty(_mapping, '_raw');
            _item[key] = treeFormat(item, _mapping);
          } else if (value.isChildren) {
            _item[key] = treeFormat(item[value.attr], mapping);
          } else {
            _item[key] = treeFormat(item[value.attr], value.mapping);
          }
        } else if (typeof value === 'function') {
          // 函数，规则转换
          _item[key] = value(item);
        } else if (typeof value === 'boolean') {
          // 布尔，同名属性映射
          _item[key] = item[key];
        } else if (typeof value === 'string') {
          // 字符串，指定属性映射
          let distAttrs = value.split('.');
          let distItem = item;
          let distValue;
          while (true) {
            if (distAttrs.length === 1) {
              distValue = distItem[distAttrs.shift()];
              break;
            }
            distItem = distItem[distAttrs.shift()];
            if (typeof distItem !== 'object') {
              break;
            }
          }
          _item[key] = distValue;
        }
      });
    } else {
      // 否则不做处理
      _item = item;
    }
    return _item;
  };

  let _res;
  if (isArray(tree)) {
    _res = tree.map(item => formatter(item, mapping));
  } else if (isObject(tree)) {
    _res = formatter(tree, mapping);
  } else {
    _res = tree;
  }
  return _res;
}

/**
 * @description: 单值过滤
 * @param {*} value
 * @param {*} dict
 * @return {*}
 */
export function singleValueFilter(value, dict) {
  const item = dict?.find(v => v.value === value);
  return item?.label ?? value;
}

/**
 * 获取路由，小门户及独立
 *
 * @export
 * @param {*} isMicroApp
 */
export const getRoutePath = isMicroApp => path => {
  return;
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

/**
 * @description: 字符串转数值
 * @param {*} num
 * @param {*} defaultValue
 * @return {*}
 */
export function toNum(num, defaultValue) {
  const n = parseFloat(num);
  if (!isNaN(n)) {
    return n;
  }
  return defaultValue === undefined ? num : defaultValue;
}

// 配置设置图片地址
export const getFileAccessHttpUrl = (avatar, subStr) => {
  if (!avatar) {
    return null;
  }
  if (!subStr) subStr = 'http';
  if (avatar && avatar.startsWith(subStr)) {
    return avatar;
  } else if (avatar && avatar.startsWith('data:image')) {
    return avatar;
  } else {
    return serverConfig.IMG_BASE_URL + avatar;
  }
};
/**
 * @description: 获取基本主题（亮、暗）
 * @param {*} theme
 * @return {*}
 */
export function getBaseTheme(theme) {
  return theme === 'dark' ? 'dark' : 'light';
}

/**
 * @description: 动态加载资源（js、css）
 * @param {*} list  列表异步加载，对象同步加载，可随意嵌套，示例如下
  const arr = [
    {
      src: '/a.js',
      children: ['/a1.js', '/a2.js'],
    },
    {
      src: ['/1b.js', { src: '/2b.js', children: ['/2b1.js'] }],
      children: ['/b1.js', { src: '/b2.js', children: ['/b21.js'] }],
    },
    '/c.js',
  ];

  加载顺序示例为：[/a.js, /1b.js, /2b.js, /c.js] -> [/a1.js, /a2.js, /2b1.js] -> [/b1.js, /b2.js] -> [/b21.js]
 * @return {*}
 */
export function loadResource(list = []) {
  const loadFn = url => {
    if (url) {
      return /\.css$/.test(url) ? loadCss(url) : loadScript(url);
    }
    return null;
  };

  const promises = list.reduce((s, v) => {
    let p = null;

    if (typeof v === 'string') {
      p = loadFn(v);
    } else if (v?.src) {
      if (typeof v.src === 'string') {
        p = loadFn(v.src);
      } else if (Array.isArray(v.src)) {
        p = loadResource(v.src);
      }
    }

    if (p && Array.isArray(v?.children)) {
      p = p.then(() => loadResource(v.children));
    }

    s.push(p);

    return s;
  }, []);

  return new Promise((resolve, reject) => {
    Promise.allSettled(promises)
      .then(resArr => {
        const rejected = resArr.filter(v => v.status === 'rejected').map(v => v.reason);

        if (rejected.length) {
          reject(rejected);
        } else {
          resolve();
        }
      })
      .catch(reject);
  });
}

/**
 * 轮询
 * @param callback 回调
 * @param delay 间隔
 * @param atBegin 开始时调用
 * @param extraRunCondition 额外的运行条件
 */
export function loopFn(callback, delay = 3000, { atBegin = false, extraRunCondition } = {}) {
  // 判断是否在vue组件中调用，以添加页面激活态进一步控制轮询以及销毁时解绑事件
  // eslint-disable-next-line
  const isVue = !!(this && this._isVue);
  // 控制轮询最小值，防止意外
  const _duration = Math.max(delay, 200);

  // 添加页面隐藏标识控制轮询
  let visible = true;
  const visibleChange = function() {
    visible = !document.hidden;
  };
  document.addEventListener('visibilitychange', visibleChange);

  // 轮询调用
  let timeout = null;
  const loopCb = () => {
    const extraRunConditionPass =
      typeof extraRunCondition === 'function' ? Boolean(extraRunCondition()) : true;
    // eslint-disable-next-line
    const canRun = visible && (!isVue || !this._inactive) && extraRunConditionPass;
    if (canRun && typeof callback === 'function') {
      callback();
    }
    loop();
  };
  const loop = function() {
    timeout && clearTimeout(timeout);
    timeout = setTimeout(loopCb, _duration);
  };
  if (atBegin) {
    loopCb();
  } else {
    loop();
  }

  // 事件解绑
  const unbind = function() {
    timeout && clearTimeout(timeout);
    document.removeEventListener('visibilitychange', visibleChange);
    if (isVue) {
      // eslint-disable-next-line no-invalid-this
      this.$off('hook:beforeDestroy', unbind);
    }
  };
  if (isVue) {
    // eslint-disable-next-line no-invalid-this
    this.$once('hook:beforeDestroy', unbind);
  }

  return unbind;
}

// 字体转换 px -> rem
export function fontChart(res) {
  let docEl = document.documentElement,
    clientWidth =
      window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  if (!clientWidth) return;
  // 此处的3840 为设计稿的宽度，记得修改！
  let fontSize = clientWidth / 1920;
  return res * fontSize;
}

// 16位颜色转rgba

export const colorRgb = (str, opacity) => {
  let sColor = str.toLowerCase();
  if (sColor) {
    if (sColor.length === 4) {
      let sColorNew = '#';
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      }
      sColor = sColorNew;
    }
    //处理六位的颜色值
    let sColorChange = [];
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
    }
    return 'rgba(' + sColorChange.join(',') + ',' + opacity + ')';
  } else {
    return sColor;
  }
};

// 将金额数字格式化为千分位
export function transMoneyNumber(value) {
  if (value || value === 0) {
    let num = value.toFixed(2);
    return !(num + '').includes('.')
      ? (num + '').replace(/\d{1,3}(?=(\d{3})+$)/g, match => {
          return match + ',';
        })
      : (num + '').replace(/\d{1,3}(?=(\d{3})+(\.))/g, match => {
          return match + ',';
        });
  } else {
    return '--';
  }
}
export function changeTree(val, infor) {
  let arr = [];
  if (val.length !== 0) {
    val.forEach(item => {
      let obj = item;
      obj.name = infor[item.name] !== undefined ? infor[item.name] : item.name;
      if (item.children && item.children.length > 0) {
        obj.children = changeTree(item.children, infor);
      }
      arr.push(obj);
    });
  }
  return arr;
}
export function toMap(dict, opts = {}) {
  const map = {};
  const dictOpts = Object.assign(
    {
      code: 'code',
      name: 'name'
    },
    opts
  );

  if (dict) {
    dict.forEach(item => {
      map[item[dictOpts.code]] = item[dictOpts.name];

      if (item.child && item.child.length) {
        const data = toMap(item.child, dictOpts);

        Object.assign(map, data);
      }
    });
  }

  return map;
}

/**
 * 计算百分比， 保留两位小数
 * @param {*} value 数量
 * @param {*} total 总数
 */
export function computePrecent(value, total) {
  let precent = '0.00';
  if (!value || !total || value <= 0 || total <= 0) {
    precent = '0.00';
  } else {
    if (isNaN(value / total)) {
      precent = '0.00';
    } else {
      let tempPrecent = ((value * 100) / total).toFixed(2);
      precent = tempPrecent < 0.01 ? '0.01' : tempPrecent + '';
    }
  }
  return precent;
}
