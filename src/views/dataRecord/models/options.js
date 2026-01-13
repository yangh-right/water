/*
 * @Description:
 * @Author: JianYue
 * @Date: 2024-04-01 17:54:28
 * @LastEditTime: 2024-04-15 13:18:20
 * @LastEditors:  Do not edit
 */
export const columns = [
  {
    title: '内回流(m³/h)',
    dataIndex: 'internalReflux',
    key: 'internalReflux',
    width: 100,
    ellipsis: true
  },
  {
    title: '内回流比',
    dataIndex: 'internalRefluxRatio',
    key: 'internalRefluxRatio',
    scopedSlots: { customRender: 'internalRefluxRatio' },
    width: 80,
    ellipsis: true
  },
  {
    title: '外回流(m³/h)',
    dataIndex: 'externalReflux',
    key: 'externalReflux',
    width: 100,
    ellipsis: true
  },
  {
    title: '外回流比',
    dataIndex: 'externalRefluxRatio',
    key: 'externalRefluxRatio',
    scopedSlots: { customRender: 'externalRefluxRatio' },
    width: 80,
    ellipsis: true
  },
  {
    title: '上报人',
    dataIndex: 'creatorName',
    key: 'creatorName',
    width: 120,
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
    title: '班组名称',
    dataIndex: 'teamName',
    key: 'teamName',
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
    show: true
  },
  {
    label: '选择日期',
    name: 'rangeTime',
    type: 'rangePicker',
    placeholder: ['开始日期', '结束日期'],
    show: true,
    attrs: {
      allowClear: true
    }
  }
];

export const searchForm = {
  waterPlantId: '',
  rangeTime: [],
  currentPage: 1,
  pageSize: 20,
  total: 0
};
