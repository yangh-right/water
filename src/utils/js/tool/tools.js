/**
 * @DATE: 2019-12-19 11:19
 * @Version: 0.0.1
 * @Author: yunchangJia
 * @Description: 项目工具类 如有需要可以参照平台公共方法
 * @Update: 更新内容 by yunchangJia 2019-12-19 11:19
 */

import Vue from 'vue';
import store from '@/store';
import moment from 'moment';
import serverConfig from '@/config/server.config';
import mapConfig from '@/config/map.config';

/**
 * 合并对象
 * @param FirstOBJ
 * @param SecondOBJ
 * @returns {*}
 */
export function deepObjectMerge(FirstOBJ, SecondOBJ) {
  for (let key in SecondOBJ) {
    FirstOBJ[key] =
      FirstOBJ[key] && FirstOBJ[key].toString() === '[object Object]'
        ? deepObjectMerge(FirstOBJ[key], SecondOBJ[key])
        : (FirstOBJ[key] = SecondOBJ[key]);
  }
  return FirstOBJ;
}
//保留digit位小数
export function keepDecimal(num, digit = 2) {
  let digitNum = Math.pow(10, digit)
  let result = parseFloat(num);
  if (isNaN(result)) {
    console.log('数字解析失败，请检查！');
    return num;
  }
  result = Math.round(result * digitNum) / digitNum;
  return result;
};
// 结果解析
export function resultParse(res) {
  if (res && res.status === 'complete') {
    return res.resultData;
  } else {
    // Vue.prototype.$message.error(res && res && res.errorMessage || '接口异常');
    return Promise.reject(res);
  }
}

// 树结构转换
export function treeTransform(tree) {
  let _tree = [];
  if (tree && tree.length) {
    tree.forEach(v =>
      _tree.push({
        id: v.id,
        label: v.name,
        value: v.id,
        children: treeTransform(v.children)
      })
    );
  }
  return _tree;
}
/**
 * 图片链接补全
 * 说明：
 * 远程图片链接格式类似 /api/userCenterApi/FileManager?url=secondary-water-supply-032969f011a92f16442dd3998c17107c/202303/caf0713bb9e44803a978f1391ff84b05.png；
 * @param url
 */
export function imageFullUrl(url) {
  return /^secondary-water-supply/.test(url) ? serverConfig.IMG_BASE_URL + url : url;
}
export function getFileUrlQuery(url) {
  return url.indexOf('url=') > -1 ? url.slice(url.indexOf('url=') + 4) : url;
}

// 动态加载css
export function loadCss(url) {
  let css = document.createElement('link');
  css.href = url;
  css.rel = 'stylesheet';
  css.type = 'text/css';
  document.head.appendChild(css);
}

// 动态加载单一script
export function loadSingleScript(src, callback) {
  let s = document.createElement('script');
  s.async = false;
  s.src = src;
  s.addEventListener(
    'load',
    function loadEvent(e) {
      s.parentNode.removeChild(s);
      s.removeEventListener('load', loadEvent, false);
      callback && callback();
    },
    false
  );
  document.body.appendChild(s);
}

// 动态加载多个script
export function loadScripts(list, callback) {
  let loaded = 0;
  let loadNext = () => {
    loadSingleScript(list[loaded], function() {
      loaded++;
      if (loaded >= list.length) {
        callback && callback();
      } else {
        loadNext();
      }
    });
  };
  loadNext();
}
//遍历树查找符合条件的子元素
export function findItemFromTree(treeData, id, key='value') {
  let targetObj = null;
  for (let index = 0; index < treeData.length; index += 1) {
    if (treeData[index][key] === id) {
      targetObj = treeData[index];
      break;
    }
    if (treeData[index].children instanceof Array && treeData[index].children.length > 0) {
      const returnObj = findItemFromTree(treeData[index].children, id, key);
      if (returnObj) return returnObj;
    }
  }
  return targetObj && { ...targetObj };
}

// 视频树处理
export function videoTreetrans(tree, isSelectable) {
  let _tree = [];
  if (tree && tree.length) {
    tree.forEach(v => {
      let node = {
        id: v.value,
        title: v.name,
        key: v.value,
        offlineStatus: v.status,
        selectable: isSelectable,
        children: videoTreetrans(v.videoList, true)
      };
      if (isSelectable) node.scopedSlots = { icon: 'status' };
      _tree.push(node);
    });
  }
  return _tree;
}

// 防抖
export function debounce(fn, wait) {
  let timeout;
  return function() {
    let args = arguments;
    timeout && clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(this, args);
    }, wait || 200);
  };
}

// 展平菜单
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

      if (menu.children && menu.children.length) {
        _menus = _menus.concat(flattenMenus(menu.children, _path));
        if (!menu.children.find(item => item.showFlag)) {
          _menus.push({
            id: menu.id,
            title: menu.title,
            name: menu.name,
            path: _path,
            buttonCode: menu.buttonCode
          });
        }
      } else if (!(menu.children && menu.children.length) || (menu.children && menu.children.length && !menu.children.find(item => item.showFlag))){
        _menus.push({
          id: menu.id,
          title: menu.title,
          name: menu.name,
          path: _path,
          buttonCode: menu.buttonCode
        });
      }
    });
  }
  return _menus;
}

// 获取当前页面菜单id
export function getMenuId(menus, path) {
  // 兼容（之前传[menus, path]，现在只需传[path]）
  const _path = path === void 0 ? menus : path;
  const menu = store.getters['setting/menuList'].find(v => v.path === _path);
  return menu ? menu.id : '';
}

// 校验菜单权限（校验方法：菜单中是否有该路径）
export function checkMenuAuth(path) {
  return !!store.getters['setting/menuList'].find(v => v.path === path);
}

// 解析经纬度
export function parseLngLat(lngLat) {
  return lngLat
    ? lngLat
        .split(',')
        .map(v => Number(v) || 0)
        .reverse()
    : null;
}

// 时间转换
export function dateFormat(item, format = 'YYYY-MM-DD HH:mm:ss') {
  return item ? (moment.isMoment(item) ? item.format(format) : moment(item).format(format)) : '--';
}

// 长文本切割
export function ellipsis(item, max) {
  return item ? (item.length > max ? item.substring(0, max) + '...' : item) : '--';
}

// 导出
export function exportFileByURL(filePath) {
  if (!!window.ActiveXObject || 'ActiveXObject' in window) {
    let elink = document.createElement('a');
    elink.href = filePath;
    document.body.appendChild(elink);
    elink.click();
    document.body.removeChild(elink);
  } else {
    window.open(filePath);
  }
}

// 分区树转换
export function mapTreeField(tree = []) {
  return tree.map(node => {
    let { label, orgName } = node;
    return {
      ...node,
      label: label + `${orgName ? `（${orgName}）` : ''}`,
      labelModified: true
    };
  });
}

/** 处理泵房/水箱位置重叠 */
export function dealSameSites(list) {
  return list.map((item, i) => {
      let {lati, longi} = item;
      let arr = [
        [-0.0002, 0],
        [0.0002, 0],
        [0, 0.0002],
        [0, -0.0002],
        [0.00015, -0.00015],
        [0.00015, 0.00015],
        [-0.00015, 0.00015],
        [-0.00015, -0.00015]
      ];
      let sort = 0;
      list.forEach((r, idx) => {
        if (r.lati === lati && r.longi === longi && idx !== i) {
          if (arr[sort]) {
            r.lati = Number(r.lati) + arr[sort][0];
            r.longi = Number(r.longi) + arr[sort][1];
            sort++;
          }
        }
      });
      return item;
  });
}
// 获取按钮权限 code:公共平台配置的按钮code
export function getButtonPermission(code) {
  return store.state.setting.buttonCodes[code];
}

// 下拉列表根据value获取name
export function transformValueToName(value, list) {
  let name;
  if (list) {
    list.forEach(v => {
      if (v.value == value || v.code == value) { // 此处用==，防止后端返回数据类型和列表value格式不一致
        name = v.name || v.label;
      }
    });
  }
  return name || value;
}
