/*
 * @Description:
 * @Author: JianYue
 * @Date: 2024-04-12 10:15:41
 * @LastEditTime: 2024-08-21 16:51:53
 * @LastEditors: wangyr
 */
export const columns = [
  {
    title: '污水厂名称',
    dataIndex: 'waterPlantName',
    key: 'waterPlantName',
    width: 150,
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
    title: '评价类型',
    dataIndex: 'evaluationType',
    key: 'evaluationType',
    scopedSlots: { customRender: 'evaluationType' },
    width: 150,
    ellipsis: true
  },
  {
    title: '频率',
    dataIndex: 'l',
    key: 'l',
    scopedSlots: { customRender: 'l' },
    width: 180,
    ellipsis: true
  },
  {
    title: '后果分析',
    dataIndex: 's',
    key: 's',
    scopedSlots: { customRender: 's' },
    width: 180,
    ellipsis: true
  },
  {
    title: '创建人',
    dataIndex: 'createBy',
    key: 'createBy',
    width: 120,
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: 150,
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
// 评价类型
export const evaluationObj = {
  1: '设备安全',
  2: '环境安全',
  3: '人员安全'
};
export const evaluationList = [
  { value: '1', label: '设备安全' },
  { value: '2', label: '环境安全' },
  { value: '3', label: '人员安全' }
];
export const frequencyList = [
  { value: 1, label: '从未发生过' },
  { value: 2, label: '每年都发生或曾经发生过' },
  { value: 3, label: '每年都发生' },
  { value: 4, label: '每季度都发生' },
  { value: 5, label: '每次作业或每月发生' }
];

export const headerFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true,
    span: 5
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
    span: 6
  },
  {
    label: '选择日期',
    name: 'rangeTime',
    type: 'rangePicker',
    placeholder: ['开始日期', '结束日期'],
    show: true,
    span: 6,
    attrs: {
      allowClear: true
    }
  }
];

export const searchForm = {
  waterPlantId: '',
  placeId: [],
  rangeTime: null,
  currentPage: 1,
  pageSize: 20,
  total: 0
};
