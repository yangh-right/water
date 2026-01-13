/*
 * @Description:
 * @Author: JianYue
 * @Date: 2024-04-01 17:54:28
 * @LastEditTime: 2024-05-14 15:02:38
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
    dataIndex: 'bucketName',
    key: 'bucketName',
    width: 150,
    ellipsis: true
  },
  {
    title: '底面积(m²)',
    dataIndex: 'basalArea',
    key: 'basalArea',
    width: 120,
    ellipsis: true
  },
  {
    title: '整体高度(m)',
    dataIndex: 'overallHeight',
    key: 'overallHeight',
    width: 120,
    ellipsis: true
  },
  {
    title: '已使用高度(m)',
    dataIndex: 'usedHeight',
    key: 'usedHeight',
    width: 120,
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
  }
];

export const searchForm = {
  waterPlantId: '',
  currentPage: 1,
  pageSize: 20,
  total: 0
};
