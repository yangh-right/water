import { handleConfig } from '@/components/SearchTable/util';
export function getConsumptionConfig(_this) {
  const config = {
    searchFields: [
      {
        name: 'date',
        type: 'date-picker',
        label: '日期',
        listeners: {
          change: value => {
            _this.handleSearch();
          }
        }
      }
    ],
    initColumns: [
      {
        title: '序号',
        dataIndex: 'num',
        key: 'num',
        customRender: (text, row, index) => {
          return index + 1;
        }
      },
      { dataIndex: 'time', title: '时间', ellipsis: true },
      { dataIndex: 'flow', title: '水量(m³)', ellipsis: true },
      {
        title: '操作',
        type: 'action',
        ifHide: _this.hideAction,
        fixed: 'right',
        width: 120,
        events: [
          {
            name: '详情',
            key: 'detail'
          },
          {
            name: '删除',
            key: 'delete'
          }
        ]
      }
    ],
    detailFields: [
      {
        name: 'time',
        type: 'date-picker',
        attrs: {
          showTime: true
        },
        label: '时间',
        rules: [{ required: true, message: '该字段不能为空' }]
      },
      {
        name: 'flow',
        type: 'input-number',
        label: '水量(m³)',
        attrs: {
          min: 0
        },
        rules: [{ required: true, message: '该字段不能为空' }]
      }
    ]
  };
  handleConfig(config);
  return config;
}
