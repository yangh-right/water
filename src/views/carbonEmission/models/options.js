/*
 * @Description:
 * @Author: JianYue
 * @Date: 2024-04-01 17:54:28
 * @LastEditTime: 2024-07-30 10:48:22
 * @LastEditors:  Do not edit
 */
export const columns = [
  {
    title: '污水厂名称',
    ellipsis: true,
    width: 150,
    dataIndex: 'waterPlantName',
    key: 'waterPlantName'
  },
  {
    title: '碳排放来源',
    dataIndex: 'sourceTypeName',
    key: 'sourceTypeName',
    width: 150,
    ellipsis: true
  },
  {
    title: '碳排放气体',
    dataIndex: 'gasType',
    key: 'gasType',
    scopedSlots: { customRender: 'gasType' },
    width: 150,
    ellipsis: true
  },
  {
    title: '排放量(tonCO₂)',
    dataIndex: 'emissionValue',
    key: 'emissionValue',
    width: 120,
    ellipsis: true
  },
  {
    title: '净水设备',
    dataIndex: 'deviceName',
    key: 'deviceName',
    width: 120,
    ellipsis: true
  },
  {
    title: '录入时间',
    dataIndex: 'dataTime',
    key: 'dataTime',
    width: 220,
    ellipsis: true
  },

  {
    title: '操作',
    width: 150,
    type: 'action',
    fixed: 'right',
    events: [
      {
        key: 'handleEdit',
        name: '编辑'
      },
      {
        key: 'handleDelete',
        name: '删除'
      }
    ]
  }
];

export const headerFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true
  },
  {
    label: '碳排放源',
    name: 'sourceTypeList',
    type: 'select',
    options: [],
    attrs: {
      mode: 'multiple',
      maxTagCount: 2,
      allowClear: true
    },
    show: true
  },
  {
    label: '碳排放气体',
    name: 'gasTypeList',
    type: 'select',
    options: [],
    attrs: {
      mode: 'multiple',
      maxTagCount: 2,
      allowClear: true
    },
    show: true
  },
  {
    label: '净水设备',
    name: 'deviceIdList',
    type: 'select',
    attrs: {
      mode: 'multiple',
      maxTagCount: 2,
      allowClear: true
    },
    options: [],
    ifRender: false
  },
  {
    label: '录入日期',
    name: 'rangeTime',
    type: 'rangePicker',
    placeholder: ['开始日期', '结束日期'],
    show: true,
    span: 8,
    attrs: {
      allowClear: true
    }
  }
];

export const searchForm = {
  waterPlantId: '',
  sourceTypeList: [],
  gasTypeList: [],
  deviceIdList: [],
  rangeTime: null,
  currentPage: 1,
  pageSize: 20,
  total: 0
};
