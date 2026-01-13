/*
 * @Author: wangyr
 * @Date: 2024-04-07 11:25:27
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-30 15:45:36
 * @Description:
 */
export const measureConfigColumns = config => {
  return [
    {
      title: '监测量名称',
      dataIndex: 'modelName',
      key: 'modelName',
      fixed: true,
      width: 150,
      ellipsis: true
    },
    {
      title: config.factory_standard,
      dataIndex: 'modelCode',
      key: 'modelCode',
      width: 120,
      ellipsis: true
    },
    {
      title: config.national_standard,
      dataIndex: 'modelTypeCode',
      key: 'modelTypeCode',
      width: 150,
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
      title: '创建人',
      dataIndex: 'createName',
      key: 'createName',
      width: 120,
      ellipsis: true
    },

    {
      title: '水厂ID',
      dataIndex: 'waterPlantId',
      key: 'waterPlantId',
      width: 120,
      ellipsis: true
    },
    {
      title: '租户id',
      dataIndex: 'tenantId',
      key: 'tenantId',
      width: 120,
      ellipsis: true
    }
  ];
};

export const headerFields = [
  {
    label: '监测量名称',
    name: 'modelName',
    type: 'input',
    placeholder: '请输入监测量名称',
    show: true,
    attrs: {
      allowClear: true
    }
  },
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true
  }
];

export const searchForm = {
  waterPlantId: '',
  modelName: '',
  currentPage: 1,
  pageSize: 20,
  total: 0
};
