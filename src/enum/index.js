/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-02-10 11:44:44
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-02-13 10:43:56
 * @Description: 
 */
// 时间控件类型
export const timeWidgetTypes = {
    d: '日',
    m: '月',
    q: '季',
    y: '年',
  };

// 阈值条件类型
export const conditionType = {
  rangeIn: '5',
  rangeOut: '6',
};

export const ratio = {
  tb: 0, // 同比
  hb: 1, // 环比
  base: 2, // 基准值
  max: 3, // 最大值
  min: 4, // 最小值
  avg: 5, // 平均值
  target: 6, // 目标值
  offset: 7, // 偏差值
  tbv: 10, // 同比量
  tbpv: 11, // 同比增长量
  hbv: 12, // 环比量
  hbpv: 13, // 环比增长量
};
