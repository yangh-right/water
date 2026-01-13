/*
 * @Description:
 * @Author: JianYue
 * @Date: 2024-04-09 15:57:15
 * @LastEditTime: 2024-05-10 15:07:33
 * @LastEditors:  Do not edit
 */
export const columns = [
  {
    title: '水厂',
    dataIndex: 'waterPlantName',
    key: 'waterPlantName',
    width: 100,
    ellipsis: true
  },
  {
    title: '构筑物名称',
    dataIndex: 'placeId',
    key: 'placeId',
    scopedSlots: { customRender: 'placeId' },
    width: 100,
    ellipsis: true
  },
  {
    title: '风险等级',
    dataIndex: 'riskLevel',
    key: 'riskLevel',
    width: 100,
    ellipsis: true
  },
  {
    title: '创建人',
    dataIndex: 'createBy',
    key: 'createBy',
    width: 100,
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 180,
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

export const headerFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true,
    span: 8
  },
  {
    label: '构筑物名称',
    name: 'placeId',
    type: 'select',
    options: [],
    placeholder: '请选择或输入构筑物',
    attrs: {
      filterOption: (input, option) => {
        return (
          option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
        );
      },
      showSearch: true,
      allowClear: true,
      mode: 'multiple'
    },
    span: 8
  },
  {
    label: '风险等级',
    name: 'riskLevel',
    type: 'select',
    options: [],
    placeholder: '请选择风险等级',
    attrs: {
      filterOption: (input, option) => {
        return (
          option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
        );
      },
      allowClear: true
    },
    span: 8
  },
  {
    label: '选择日期',
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
  rangeTime: [],
  placeId: [],
  riskLevel: undefined,
  currentPage: 1,
  pageSize: 20,
  total: 0
};
