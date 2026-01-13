/*
 * @Description:
 * @Author: JianYue
 * @Date: 2024-04-09 08:38:02
 * @LastEditTime: 2024-09-03 17:20:19
 * @LastEditors:  Do not edit
 */
export const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 80,
    fixed: 'left',
    align: 'center',
    customRender: (text, row, index) => {
      return index + 1;
    }
  },
  {
    title: '污水厂名称',
    width: 120,
    dataIndex: 'waterPlantId',
    scopedSlots: { customRender: 'waterPlantId' },
    ellipsis: true
  },
  // {
  //   title: '构筑物',
  //   width: 180,
  //   dataIndex: 'placeId',
  //   scopedSlots: { customRender: 'placeId' },
  //   ellipsis: true
  // },
  {
    title: '决策配置描述',
    width: 180,
    dataIndex: 'desc',
    ellipsis: true
  },
  // {
  //   title: '决策因素详情',
  //   width: 120,
  //   dataIndex: 'id',
  //   scopedSlots: { customRender: 'id' },
  //   ellipsis: true
  // },
  {
    title: '总调控措施列表',
    width: 120,
    dataIndex: 'planList',
    scopedSlots: { customRender: 'planList' },
    ellipsis: true
  },
  {
    title: '条件描述',
    width: 380,
    dataIndex: 'conditionDescStrList',
    scopedSlots: { customRender: 'conditionDescStrList' }
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
        key: 'editControlDecision',
        name: '决策因素'
      }
    ]
  }
];

export const planListColumns = [
  {
    title: '序号',
    dataIndex: 'num',
    key: 'num',
    width: 60,
    customRender: (text, row, index) => {
      return index + 1;
    }
  },
  // {
  //   title: '模型监测量',
  //   dataIndex: 'modelPoint',
  //   width: 100,
  //   scopedSlots: { customRender: 'modelPoint' }
  // },
  // {
  //   title: '控制值',
  //   dataIndex: 'modelValue',
  //   ellipsis: true,
  //   width: 60,
  //   scopedSlots: { customRender: 'modelValue' }
  // },
  {
    title: '措施类型',
    dataIndex: 'measuresType',
    scopedSlots: { customRender: 'measuresType' },
    width: 120
  },
  {
    title: '措施',
    dataIndex: 'measures',
    width: 220,
    scopedSlots: { customRender: 'measures' }
  },
  {
    title: '排序',
    dataIndex: 'sort',
    ellipsis: true,
    scopedSlots: { customRender: 'sort' },
    width: 60
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 100,
    scopedSlots: { customRender: 'operation' }
  }
];

export const expertProcessColumns = [
  {
    title: '序号',
    dataIndex: 'num',
    key: 'num',
    width: 50,
    customRender: (text, row, index) => {
      return index + 1;
    }
  },
  {
    title: '因素',
    dataIndex: 'factorTypeName',
    ellipsis: false,
    width: 100,
    scopedSlots: { customRender: 'factorTypeName' }
  },
  {
    title: '生效条件',
    dataIndex: 'conditionDescStrList',
    ellipsis: false,
    width: 120,
    scopedSlots: { customRender: 'conditionDescStrList' }
  },
  {
    title: '选择措施',
    dataIndex: 'planList',
    ellipsis: false,
    scopedSlots: { customRender: 'planList' },
    width: 160
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 100,
    scopedSlots: { customRender: 'operation' }
  }
];

export const headerFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true,
    span: 8,
    labelCol: { span: 6 },
    wrapperCol: { span: 18 }
  },
  {
    name: 'action',
    type: 'input',
    wrapperCol: { span: 24 },
    span: 8
  }
];

export const searchForm = {
  waterPlantId: '',
  type: '',
  currentPage: 1,
  pageSize: 20,
  total: 0
};
