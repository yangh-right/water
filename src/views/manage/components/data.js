/*
 * @Author: wangyr
 * @Date: 2022-12-06 13:26:34
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-06-29 14:00:22
 * @Description:
 */
export const columns = [
  {
    title: '',
    width: 80,
    dataIndex: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    title: '进水量(m³)',
    width: 120,
    dataIndex: 'water'
  },
  {
    title: '总耗电量(kw)',
    width: 120,
    dataIndex: 'electricity'
  },
  {
    title: '千吨水电耗(kw.h/km³)',
    width: 160,
    dataIndex: 'energy'
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

export const toolIcon = [
  {
    title: '折线图',
    icon: 'ic_chart_line',
    type: 'line'
  },
  {
    title: '表格',
    icon: 'ic_chart_table1',
    type: 'table'
  },
  {
    title: '导出',
    icon: 'ic_file_download',
    type: 'export'
  }
];
