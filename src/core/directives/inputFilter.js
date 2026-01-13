/*
 * @Description: 表单字段过滤值格式
 * @Author: huhaiou
 * @Date: 2022-04-08 11:36:42
 * @LastEditTime: 2022-04-08 11:54:42
 * @LastEditors: huhaiou
 */

const addListener = function(el, type, fn) {
  el.addEventListener(type, fn, false);
}

// 特殊字符
const specialFilter = function(el) {
  addListener(el, 'keyup', () => {
    el.value = el.value.replace(/[%_]/g, '');
  })
}

export const inputFilter = {
  bind(el, binding) {
    if (el.tagName.toLowerCase() !== 'input') {
      el = el.getElementByTagName('input')[0];
    }
    switch(binding.arg) {
      case 'special':
        specialFilter(el);
        break;
      default:
        break;
    }
  }
}
