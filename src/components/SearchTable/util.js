/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-11-08 09:47:53
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-09-18 09:12:21
 * @Description:
 */
import store from '@/store';
export function filterOption(input, option) {
  return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}
export function disableButton(code) {
  return !store.state.setting.buttonCodes[code];
}

export function handleConfig(config) {
  handleSearchFields(config.searchFields);
  handleColumns(config);
  handleDetailFields(config.detailFields);
}
export function handleSearchFields(list) {
  list?.forEach(item => {
    !item.attrs && (item.attrs = {});
    if (item.attrs.allowClear === undefined) item.attrs.allowClear = true
    if (item.type === 'input') {
      item.attrs.maxLength = 99999;
    }
    if (item.type === 'select') {
      if (!item.options) item.options = []
      item.attrs.showSearch = true;
      item.attrs.filterOption = filterOption;
    } 
    if (item.type === 'radio-group') {
      if (!item.options) item.options = []
    } 
    if (item.type === 'date-picker' || item.type === 'range-picker') {
      if (item.attrs.allowClear === undefined) item.attrs.allowClear = true
    } 
    if (item.type === 'tree-select') {
      item.attrs.showSearch = true;
      item.attrs.treeData = item.attrs.treeData || []
    } 
    if (!item.placeholder) {
      if (['select',  'tree-select','date-picker', 'range-picker'].includes(item.type)) {
        item.placeholder = '请选择'
      } else {
        item.placeholder = '请输入'
      }
    }
  });
}
export function handleDetailFields(list) {
  list?.forEach(item => {
    !item.attrs && (item.attrs = {});
    if (item.type === 'input') {
      item.attrs.maxLength = 99999;
    }
    if (item.type === 'select') {
      if (!item.options) item.options = []
      if (item.attrs.allowClear === undefined) item.attrs.allowClear = true
      item.attrs.showSearch = true;
      item.attrs.filterOption = filterOption;
    }
    if (item.type === 'date-picker' || item.type === 'range-picker') {
      if (item.attrs.allowClear === undefined) item.attrs.allowClear = true
    } 
    if (item.type === 'tree-select') {
      if (item.attrs.allowClear === undefined) item.attrs.allowClear = true
      item.attrs.showSearch = true;
      item.attrs.treeData = item.attrs.treeData || []
    } 
    if (!item.placeholder) {
      if (['select',  'tree-select','date-picker', 'range-picker'].includes(item.type)) {
        item.placeholder = '请选择'
      } else {
        item.placeholder = '请输入'
      }
    }
  });
}
export function handleColumns(config) {
  if (Array.isArray(config.initColumns)) {
    config.initColumns = config.initColumns.filter(item => !item.ifHide)
    config.initColumns.forEach((item, i) => {
      if (item.type === 'action') {
        if (item.events) {
          item.events = item.events.filter(btn => !btn.ifHide);
        }
        if (!item?.events?.length) {
          config.initColumns.splice(i, 1);
        }
      }
    });
  }
}
