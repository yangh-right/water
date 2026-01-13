/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2022-09-24 16:26:12
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2022-09-28 15:26:30
 * @Description:
 */
export const numValidator = (rule, value, callback) => {
  if (Number(value) < 0) {
    callback('数值不能小于0');
  } else {
    callback();
  }
};
export const numValidator1 = (rule, value, callback) => {
  if (Number(value) < 1) {
    callback('数值不能小于1');
  } else {
    callback();
  }
};
export const handleNum1 = value => {
  let strNum = '' + value;
  if (strNum.indexOf('.') > -1 && strNum.length - strNum.indexOf('.') > 3) {
    strNum = strNum.slice(0, strNum.indexOf('.') + 3);
  }
  return Number(strNum);
};
export const handleNum = value => {
  let strNum = '' + value;
  if (strNum.indexOf('.') > -1 && strNum.length - strNum.indexOf('.') > 3) {
    strNum = Number(strNum).toFixed(2);
  }
  return Number(strNum);
};
export const handlePrice = value => {
  let strNum = '' + value;
  return Number(strNum).toFixed(2);
};
