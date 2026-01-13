export const columns = [
  {
    title: '文件名称',
    dataIndex: 'fileOriginName',
    ellipsis: true,
    width: 150
  },
  {
    title: '文件日期',
    dataIndex: 'fileTime',
    ellipsis: true,
    width: 150
    // scopedSlots: { customRender: 'startDate' }
  },
  {
    title: '创建时间',
    ellipsis: true,
    width: 150,
    dataIndex: 'createTime'
  },
  {
    title: '污水厂名称',
    ellipsis: true,
    width: 150,
    dataIndex: 'plantId'
  },
  {
    title: '操作人',
    ellipsis: true,
    width: 150,
    dataIndex: 'createUser'
  },
  {
    title: '文件格式',
    ellipsis: true,
    align: 'center',
    width: 150,
    dataIndex: 'fileFormat'
    //scopedSlots: { customRender: 'fileFormat' }
  },
  {
    title: '操作',
    width: 200,
    type: 'action',
    events: [
      {
        key: 'downLoad',
        name: '下载'
      },
      {
        key: 'itemEdit',
        name: '编辑'
      },
      {
        key: 'itemDelete',
        name: '删除'
      }
    ]
  }
];
