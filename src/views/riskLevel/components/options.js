/*
 * @Description:
 * @Author: JianYue
 * @Date: 2024-04-09 08:38:02
 * @LastEditTime: 2024-05-14 11:33:12
 * @LastEditors: wangyr
 */
export const columns = [
  {
    title: '构筑物名称',
    dataIndex: 'alarmName',
    key: 'alarmName',
    width: '30%',
    ellipsis: true
  },
  {
    title: '风险等级',
    dataIndex: 'riskLevel',
    key: 'riskLevel',
    width: '30%',
    ellipsis: true
  },
  {
    title: '报警记录',
    dataIndex: 'alarmTime',
    key: 'alarmTime',
    width: '30%',
    ellipsis: true
  }
];

export const headerFields = [
  {
    label: '构筑物',
    name: 'placeId',
    type: 'tree-select',
    span: 10,
    placeholder: '请输入或选择构筑物',
    attrs: {
      showSearch: true,
      allowClear: true,
      treeCheckable: true,
      treeData: [],
      treeNodeFilterProp: 'title',
      'dropdown-style': {
        maxHeight: '300px',
        overflow: 'auto'
      },
      maxTagCount: 2,
      treeDefaultExpandAll: true
    },
    rules: [{ required: true, message: '请选择构筑物' }]
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
  placeId: ['allCheck'],
  rangeTime: [],
  currentPage: 1,
  pageSize: 20,
  total: 0
};
