/*
 * @Description:
 * @Author: JianYue
 * @Date: 2024-04-09 15:57:15
 * @LastEditTime: 2024-08-21 10:21:29
 * @LastEditors: wangyr
 */
export const medicineAnalyseColumns = [
  {
    title: '水厂',
    dataIndex: 'waterPlantName',
    key: 'waterPlantName',
    width: 100,
    ellipsis: true
  },
  {
    title: '构筑物名称',
    dataIndex: 'placeName',
    key: 'placeName',
    width: 80,
    ellipsis: true
  },
  {
    title: '药剂名称',
    dataIndex: 'entryName',
    key: 'entryName',
    width: 100,
    ellipsis: true
  },
  {
    title: '值',
    dataIndex: 'entryValue',
    key: 'entryValue',
    width: 80,
    ellipsis: true
  },
  {
    title: '数据录入时间',
    dataIndex: 'dataTime',
    key: 'dataTime',
    width: 120,
    ellipsis: true
  },
  {
    title: '操作',
    width: 120,
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
export const sludgeAnalyseColumns = [
  {
    title: '水厂',
    dataIndex: 'waterPlantName',
    key: 'waterPlantName',
    width: 100,
    ellipsis: true
  },
  {
    title: '名称',
    dataIndex: 'entryName',
    key: 'entryName',
    width: 100,
    ellipsis: true
  },
  {
    title: '值(kg)',
    dataIndex: 'entryValue',
    key: 'entryValue',
    width: 80,
    ellipsis: true
  },
  {
    title: '数据录入时间',
    dataIndex: 'dataTime',
    key: 'dataTime',
    width: 120,
    ellipsis: true
  },
  {
    title: '操作',
    width: 120,
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
export const medicineAnalyseFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true,
    span: 4
  },
  {
    label: '构筑物名称',
    name: 'placeId',
    type: 'select',
    options: [],
    placeholder: '请选择构筑物',
    attrs: {
      filterOption: (input, option) => {
        return (
          option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
        );
      },
      showSearch: true,
      allowClear: true
    },
    span: 4
  },
  {
    label: '选择日期',
    name: 'rangeTime',
    type: 'rangePicker',
    placeholder: ['开始日期', '结束日期'],
    show: true,
    span: 7,
    attrs: {
      allowClear: true
    }
  }
];
export const sludgeAnalyseFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true,
    span: 4
  },
  {
    label: '选择日期',
    name: 'rangeTime',
    type: 'rangePicker',
    placeholder: ['开始日期', '结束日期'],
    show: true,
    span: 7,
    attrs: {
      allowClear: true
    }
  }
];
export const searchForm = {
  waterPlantId: '',
  rangeTime: [],
  placeId: undefined,
  currentPage: 1,
  pageSize: 20,
  total: 0
};
