/*
 * @Description:
 * @Author: JianYue
 * @Date: 2024-04-09 08:38:02
 * @LastEditTime: 2024-05-16 11:41:24
 * @LastEditors:  Do not edit
 */
export const columns = config => {
  return [
    {
      title: '序号',
      dataIndex: 'num',
      key: 'num',
      fixed: 'left',
      width: 80,
      ellipsis: true
    },
    {
      title: '污水厂名称',
      dataIndex: 'waterPlantName',
      key: 'waterPlantName',
      width: 120,
      ellipsis: true
    },
    {
      title: '监测量名称',
      dataIndex: 'pointName',
      key: 'pointName',
      width: 120,
      ellipsis: true
    },
    {
      title: '监测量描述',
      dataIndex: 'pointMemo',
      key: 'pointMemo',
      width: 120,
      ellipsis: true
    },
    {
      title: `${config.factory_standard}/${config.national_standard}`,
      dataIndex: 'type',
      key: 'type',
      scopedSlots: { customRender: 'type' },
      width: 120,
      ellipsis: true
    },
    {
      title: '警戒等级',
      dataIndex: 'warnLevel',
      key: 'warnLevel',
      width: 120,
      ellipsis: true
    },
    {
      title: '警戒值下限',
      dataIndex: 'warnMin',
      key: 'warnMin',
      width: 120,
      ellipsis: true
    },
    {
      title: '运算符',
      dataIndex: 'warnOpt',
      scopedSlots: { customRender: 'warnOpt' },
      width: 120,
      ellipsis: true
    },
    {
      title: '警戒值上限',
      dataIndex: 'warnMax',
      key: 'warnMax',
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
};

export const headerFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true,
    span: 8
  },
  {
    label: '类型',
    name: 'type',
    type: 'select',
    placeholder: '请选择类型',
    options: [
      {
        label: '全部',
        value: ''
      },
      {
        label: '内控',
        value: 1
      },
      {
        label: '设计',
        value: 2
      }
    ],
    show: true,
    span: 8
  },
  {
    label: '关键词',
    name: 'keyword',
    placeholder: '请输入监测量名称',
    type: 'input',
    show: true,
    span: 8
  }
];

export const searchForm = {
  waterPlantId: '',
  keyword: '',
  type: '',
  typelist: [1, 2]
};
