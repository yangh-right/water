/*
 * @Description:
 * @Author: JianYue
 * @Date: 2024-04-02 14:44:03
 * @LastEditTime: 2024-09-05 11:12:44
 * @LastEditors: wangyr
 */
export const fieldsList = [
  {
    search: true,
    name: 'waterPlantId',
    type: 'select',
    span: 6,
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    label: '选择污水厂'
  },
  {
    label: '构筑物',
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
      allowClear: true
    },
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    span: 6
  },
  {
    search: true,
    name: 'keyword',
    type: 'input',
    span: 6,
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
    placeholder: '请输入模型编号',
    label: '模型编号'
  },
  {
    name: 'action',
    type: 'input',
    wrapperCol: { span: 24 },
    span: 24,
    show: true
  }
];
export const searchForm = {
  waterPlantId: '',
  placeId: undefined,
  keyword: '',
  currentPage: 1,
  pageSize: 20,
  total: 0
};
export const columns = [
  {
    title: '模型监测量编号',
    dataIndex: 'modelName',
    key: 'modelName',
    width: 150,
    ellipsis: true
  },
  {
    title: '模型监测量名称',
    dataIndex: 'modelMemo',
    key: 'modelMemo',
    width: 150,
    ellipsis: true
  },
  {
    title: '模型编号别名',
    dataIndex: 'modelAlias',
    key: 'modelAlias',
    width: 150,
    ellipsis: true
  },
  {
    title: '默认值',
    dataIndex: 'defaultValue',
    key: 'defaultValue',
    width: 100,
    ellipsis: true
  },
  {
    title: '模型监测量单位',
    dataIndex: 'modelUnit',
    key: 'modelUnit',
    width: 100,
    ellipsis: true
  },
  {
    title: '构筑物',
    dataIndex: 'placeName',
    key: 'placeName',
    width: 180,
    ellipsis: true
  },
  {
    title: '行业设备监测量',
    dataIndex: 'pointName',
    key: 'pointName',
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

export const placeColumns = [
  {
    title: '构筑物名称',
    dataIndex: 'placeName',
    key: 'placeName',
    width: 150,
    ellipsis: true
  },
  {
    title: '编号类型',
    dataIndex: 'typeName',
    key: 'typeName',
    width: 150,
    ellipsis: true
  },
  {
    title: '模型编号',
    dataIndex: 'modelCode',
    key: 'modelCode',
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
