/*
 * @Author: wangyr
 * @Date: 2023-07-28 16:52:34
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-30 15:48:49
 * @Description:
 */

export const runFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true
  },
  {
    label: '当前方案',
    name: 'programme',
    type: 'select',
    show: true
  }
];

export const matchColumns = [
  {
    title: '泵',
    width: 80,
    dataIndex: 'pumpId',
    scopedSlots: { customRender: 'pumpId' }
  },
  {
    title: '运行时长(h)',
    width: 120,
    dataIndex: 'totalRun'
  },
  {
    title: '高效时长占比',
    width: 120,
    dataIndex: 'highRun',
    customRender: (text, row, index) => {
      return `${text}%`;
    }
  },
  {
    title: '低效时长占比',
    width: 160,
    dataIndex: 'lowRun',
    customRender: (text, row, index) => {
      return `${text}%`;
    }
  }
];
