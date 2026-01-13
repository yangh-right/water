/*
 * @Author: wangyr
 * @Date: 2024-04-29 09:02:28
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-29 09:42:13
 * @Description:
 */
export const reportReviewcolumns = [
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
    align: 'center',
    width: 150
  },
  {
    title: '审核状态',
    dataIndex: 'auditStatus',
    ellipsis: true,
    align: 'center',
    width: 150
  },
  {
    title: '创建时间',
    ellipsis: true,
    align: 'center',
    width: 150,
    dataIndex: 'createTime'
  },
  {
    title: '污水厂名称',
    ellipsis: true,
    align: 'center',
    width: 150,
    dataIndex: 'plantId'
  },
  {
    title: '操作人',
    ellipsis: true,
    align: 'center',
    width: 150,
    dataIndex: 'createUser'
  },
  {
    title: '文件格式',
    ellipsis: true,
    align: 'center',
    width: 150,
    dataIndex: 'fileFormat'
  },
  {
    title: '操作',
    width: 200,
    align: 'center',
    type: 'action',
    events: [
      {
        key: 'downLoad',
        name: '下载'
      },
      {
        key: 'itemAuditing',
        name: '审核'
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

export const riskListcolumns = [
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
    align: 'center',
    width: 150
  },
  // {
  //   title: '审核状态',
  //   dataIndex: 'auditStatus',
  //   ellipsis: true,
  //   align: 'center',
  //   width: 150
  // },
  {
    title: '创建时间',
    ellipsis: true,
    align: 'center',
    width: 150,
    dataIndex: 'createTime'
  },
  {
    title: '污水厂名称',
    ellipsis: true,
    align: 'center',
    width: 150,
    dataIndex: 'plantId'
  },
  {
    title: '操作人',
    ellipsis: true,
    align: 'center',
    width: 150,
    dataIndex: 'createUser'
  },
  {
    title: '文件格式',
    ellipsis: true,
    align: 'center',
    width: 150,
    dataIndex: 'fileFormat'
  },
  {
    title: '操作',
    width: 200,
    align: 'center',
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
