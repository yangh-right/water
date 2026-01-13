export const searchForm = {
  waterPlantId: '',
  deviceStatus: '',
  operateType: '',
  placeId: ''
};

export const headerFields = [
  {
    label: '选择污水厂',
    name: 'waterPlantId',
    type: 'select',
    show: true,
    isCommonScreen: true
  },
  {
    label: '仪表状态',
    name: 'deviceStatus',
    type: 'select',
    show: true,
    isCommonScreen: true,
    placeholder: '全部',
    attrs: {
      allowClear: true
    },
    options: [],
    extraOption: [
      {
        label: '全部',
        value: ''
      }
    ]
  },
  {
    label: '保养类型',
    name: 'operateType',
    type: 'select',
    show: true,
    isCommonScreen: true,
    placeholder: '全部',
    attrs: {
      allowClear: true
    },
    options: [],
    extraOption: [
      {
        label: '全部',
        value: ''
      }
    ]
  },
  {
    label: '仪表位置',
    name: 'placeId',
    type: 'select',
    show: true,
    isCommonScreen: true,
    placeholder: '全部',
    options: [],
    attrs: {
      allowClear: true
    },
    extraOption: [
      {
        label: '全部',
        value: ''
      }
    ]
  }
];
