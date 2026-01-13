/*
 * @Description:
 * @Author: JianYue
 * @Date: 2024-04-12 10:15:41
 * @LastEditTime: 2024-04-30 16:12:06
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
    title: '构筑物',
    dataIndex: 'placeId',
    key: 'placeId',
    scopedSlots: { customRender: 'placeId' },
    width: 150,
    ellipsis: true
  },
  {
    title: '指标名称',
    dataIndex: 'indicatorName',
    key: 'indicatorName',
    width: 120,
    ellipsis: true
  },
  {
    title: '采集时间',
    dataIndex: 'collectionTime',
    key: 'collectionTime',
    width: 180,
    ellipsis: true
  },
  {
    title: '指标值',
    dataIndex: 'indicatorValue',
    key: 'indicatorValue',
    width: 120,
    ellipsis: true
  },
  {
    title: '污泥颜色',
    dataIndex: 'colour',
    key: 'colour',
    width: 120,
    ellipsis: true
  },
  {
    title: '图片地址',
    dataIndex: 'imageUrl',
    key: 'imageUrl',
    scopedSlots: { customRender: 'imageUrl' },
    width: 180,
    ellipsis: true
  },
  {
    title: '指标描述',
    dataIndex: 'indicatorMemo',
    key: 'indicatorMemo',
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

export const headerFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true,
    span: 5
  },
  {
    label: '构筑物',
    name: 'placeId',
    type: 'select',
    placeholder: '请选择构筑物',
    options: [],
    show: true,
    span: 5,
    attrs: { allowClear: true }
  },
  {
    label: '指标名称',
    name: 'indicatorName',
    type: 'select',
    options: [
      { value: 'SV5', label: 'SV5' },
      { value: 'SV10', label: 'SV10' },
      { value: 'SV30', label: 'SV30' }
    ],
    show: true,
    span: 6,
    attrs: { allowClear: true }
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
  indicatorName: undefined,
  placeId: undefined,
  rangeTime: null,
  currentPage: 1,
  pageSize: 20,
  total: 0
};
