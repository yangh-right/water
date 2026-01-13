/*
 * @Author: wangyr
 * @Date: 2023-04-21 13:43:23
 * @LastEditors: wangyr
 * @LastEditTime: 2025-02-11 09:33:15
 * @Description:
 */

export const alarmColumns = [
  // {
  //   title: '状态',
  //   width: 60,
  //   align: 'center',
  //   dataIndex: 'alarmStatus',
  //   scopedSlots: { customRender: 'status' }
  // },
  {
    title: '报警名称',
    width: 100,
    align: 'center',
    ellipsis: true,
    dataIndex: 'alarmName'
  },
  {
    title: '报警值',
    width: 100,
    align: 'center',
    ellipsis: true,
    dataIndex: 'startData',
    customRender: (text, row, index) => {
      return text || text == '0' ? `${text}${row.pointUnit}`: '--';
    }
  },
  {
    title: '时间',
    width: 160,
    align: 'center',
    ellipsis: true,
    dataIndex: 'startTime'
  }
  // {
  //   title: '操作',
  //   width: 80,
  //   align: 'center',
  //   fixed: 'right',
  //   scopedSlots: { customRender: 'action' }
  // }
];

export const deviceColumns = [
  {
    title: '状态',
    width: 60,
    align: 'center',
    dataIndex: 'deviceStatus',
    scopedSlots: { customRender: 'status' }
  },
  {
    title: '仪表名称',
    width: 110,
    align: 'center',
    ellipsis: true,
    dataIndex: 'deviceName'
  },
  {
    title: '时间',
    width: 100,
    align: 'center',
    ellipsis: true,
    dataIndex: 'createTime',
    customRender: (text, row, index) => {
      return !!text ? text.slice(0, 10) : '--';
    }
  },
  {
    title: '位置',
    width: 80,
    align: 'center',
    ellipsis: true,
    dataIndex: 'placeName',
    scopedSlots: { customRender: 'placeName' }
  }
  // {
  //   title: '操作',
  //   width: 80,
  //   align: 'center',
  //   fixed: 'right',
  //   scopedSlots: { customRender: 'action' }
  // }
];
