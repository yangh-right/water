/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-06-19 09:16:58
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-06-19 09:18:50
 * @Description: 
 */


export const pumpTypeColumns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 80,
    fixed: 'left',
    align: 'center',
    customRender: (text, row, index) => {
      return index + 1;
    },
    defaultChecked: true
  },
  {
    title: '水泵型号',
    dataIndex: 'pumpModel',
    key: 'pumpModel',
    width: 120,
    ellipsis: true,
    defaultChecked: true
  },
  {
    title: '扬程到流量(拟合曲线参数)',
    dataIndex: 'qHParamList',
    key: 'qHParamList',
    width: 180,
    ellipsis: true,
    defaultChecked: true
  },
  {
    title: '流量到扬程(拟合曲线参数)',
    key: 'hQParamList',
    dataIndex: 'hQParamList',
    width: 180,
    ellipsis: true,
    scopedSlots: { customRender: 'hQParamList' }
  },
  {
    title: '流量到频率(拟合曲线参数)',
    key: 'pQParamList',
    dataIndex: 'pQParamList',
    width: 180,
    ellipsis: true,
    scopedSlots: { customRender: 'pQParamList' }
  },
  {
    title: '频率到流量(拟合曲线参数)',
    key: 'qPParamList',
    ellipsis: true,
    dataIndex: 'qPParamList',
    width: 180
  },
  {
    title: '流量到效率(拟合曲线参数)',
    key: 'eQParamList',
    ellipsis: true,
    dataIndex: 'eQParamList',
    width: 180
  },
  {
    title: '工频最大效率',
    key: 'maxEfficiency',
    dataIndex: 'maxEfficiency',
    width: 120
  },
  {
    title: '操作',
    key: 'action',
    dataIndex: 'action',
    width: 120,
    fixed: 'right',
    defaultChecked: true,
    scopedSlots: { customRender: 'action' }
  }
];

