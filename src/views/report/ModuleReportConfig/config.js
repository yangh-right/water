/*
 * @Description:
 * @Author: JianYue
 * @Date: 2024-05-07 18:47:58
 * @LastEditTime: 2024-05-09 18:39:44
 * @LastEditors:  Do not edit
 */
export const fields = [
  {
    name: 'waterPlantId',
    label: '选择污水厂',
    type: 'select',
    placeholder: '请选择',
    colon: true,
    options: [],
    span: 4,
    attrs: {
      allowClear: true
    },
    value: undefined,
    listeners: { change: null }
  },
  {
    search: true,
    name: 'keywords',
    type: 'input',
    colon: true,
    label: '模板名称',
    placeholder: '请输入 ',
    listeners: {}
  },
  {
    search: true,
    name: 'templateType',
    colon: true,
    type: 'select',
    label: '分类',
    placeholder: '请选择',
    options: [],
    listeners: {
      change: null
    }
  },
  {
    search: true,
    name: 'reportType',
    type: 'select',
    colon: true,
    label: '类型',
    placeholder: '请选择',
    options: [],
    listeners: {
      change: null
    }
  }
];

export const columns = [
  // {
  //   title: '选择水厂',
  //   ellipsis: true,
  //   dataIndex: 'waterPlantId'
  // },
  {
    title: '模板名称',
    ellipsis: true,
    defaultValue: '--',
    dataIndex: 'name'
  },

  {
    title: '模板分类',
    ellipsis: true,
    dataIndex: 'templateTypeName'
  },
  {
    title: '报表类型',
    ellipsis: true,
    dataIndex: 'reportTypeName'
  },
  {
    title: '是否有效',
    ellipsis: true,
    dataIndex: 'validFlag',
    type: 'switch'
  },
  {
    title: '操作',
    width: 180,
    type: 'action',
    align: 'center',
    events: [
      { name: '详情', key: 'detail' },
      { name: '编辑', key: 'edit' },
      { name: '删除', key: 'del', type: 'danger' }
    ]
  }
];
