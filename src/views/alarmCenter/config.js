export const searchForm = {
  waterPlantId: undefined,
  total: 2000,
  currentPage: 1,
  pageSize: 2000
};

export const headerFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true,
    span: 5
  }
];
export const columns = [
  { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName', width: 200 },
  { title: '防区名称', dataIndex: 'sectorsName', key: 'sectorsName', width: 200 },
  { title: '防区类型', dataIndex: 'sectorsTypeName', key: 'sectorsTypeName', width: 200 },
  { title: '防区状态', dataIndex: 'statusTypeName', key: 'statusTypeName', width: 200 }
];
