/*
 * @Description:
 * @Author: JianYue
 * @Date: 2024-04-01 17:54:28
 * @LastEditTime: 2024-05-14 19:54:21
 * @LastEditors:  Do not edit
 */
export const columns = [
  {
    title: '污水厂名称',
    ellipsis: true,
    width: 150,
    dataIndex: 'waterPlantId',
    type: 'factory'
  },
  {
    title: '桶名称',
    dataIndex: 'bucketId',
    key: 'bucketId',
    scopedSlots: { customRender: 'bucketId' },
    width: 150,
    ellipsis: true
  },
  {
    title: '排砂量(t)',
    dataIndex: 'sedimentDischarge',
    key: 'sedimentDischarge',
    width: 120,
    ellipsis: true
  },
  {
    title: '记录时间',
    dataIndex: 'dataTime',
    key: 'dataTime',
    width: 220,
    ellipsis: true
  },
  {
    title: '操作',
    width: 220,
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
    label: '砂桶名称',
    name: 'bucketId',
    type: 'select',
    options: [],
    show: true,
    attrs: {
      allowClear: true
    }
  }
];

export const searchForm = {
  waterPlantId: '',
  bucketId: undefined,
  currentPage: 1,
  pageSize: 20,
  total: 0
};
