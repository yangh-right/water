/*
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-03-23 10:46:55
 * @LastEditTime: 2022-03-23 10:46:56
 * @LastEditors: huhaiou
 */

/**
 * 生成随机数字 [start, end)
 * @param {Number} start
 * @param {Number} end
 */
export default function (start, end) {
  return Math.floor(Math.random() * (end - start) + start);
}
