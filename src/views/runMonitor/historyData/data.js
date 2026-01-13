/*
 * @Description: 历史数据的数据配置
 * @version:
 * @Author: liuct
 * @Date: 2021-07-15 09:21:52
 * @LastEditors: 王永瑞 1637350822@qq.com
 * @LastEditTime: 2022-09-19 09:18:59
 */

export const spaces0 = [
  { label: '1分钟', value: '1', timeEnum: 'MINUTES' },
  { label: '5分钟', value: '5', timeEnum: 'MINUTES' },
  { label: '15分钟', value: '15', timeEnum: 'MINUTES' },
  { label: '30分钟', value: '30', timeEnum: 'MINUTES' },
  { label: '1小时', value: '60', timeEnum: 'MINUTES' }
];

export const spaces1 = [
  { label: '1小时', value: 'HOURS' },
  { label: '天', value: 'DAYS' }
];

export const intervals0 = [
  {
    label: '近1小时',
    value: '1hours',
    space: '1',
    type: 'hours'
    // startDate: moment().subtract(2, 'hours'),
    // endDate: moment()
  },
  {
    label: '24小时',
    value: '24hours',
    space: '24',
    type: 'hours'
    // startDate: moment().subtract(24, 'hours'),
    // endDate: moment()
  },
  {
    label: '3天',
    value: '3days',
    space: '3',
    type: 'day'
    //  startDate: moment().subtract(2, 'day'),
    //  endDate: moment()
  },
  {
    label: '7天',
    value: '7days',
    space: '7',
    type: 'day'
    // startDate: moment().subtract(6, 'day'),
    //  endDate: moment()
  },
  {
    label: '30天',
    value: '30days',
    space: '30',
    type: 'day'
    // startDate: moment().subtract(29, 'day'),
    //  endDate: moment()
  },
  { label: '自定义', value: '' }
];

export const intervals1 = [
  { label: '日', value: '1' },
  { label: '月', value: '2' }
];

export const typeList = [
  { label: '单时段', value: '0' },
  { label: '多时段', value: '1' }
];
