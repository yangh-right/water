import { handleConfig } from '@/components/SearchTable/util';
export function getDangerConfig(_this) {
  const config = {
    searchFields: [
      {
        name: 'keyword',
        type: 'input',
        label: '关键字'
      },
      {
        name: 'date',
        type: 'range-picker',
        placeholder: ['开始日期', '结束日期'],
        label: '采样日期'
      }
    ],
    initColumns: [
      {
        title: '序号',
        dataIndex: 'num',
        key: 'num',
        width: 80,
        customRender: (text, row, index) => {
          return index + 1;
        }
      },
      { dataIndex: 'sampleNo', title: '采样编号', ellipsis: true },
      { dataIndex: 'sampleDateTime', title: '采样时间', ellipsis: true },
      { dataIndex: 'samplePoint', title: '采样点', ellipsis: true },
      { dataIndex: 'sampleTimeAddress', title: '采样地点地址', ellipsis: true },
      { dataIndex: 'ticketNo', title: '工单编号', ellipsis: true }
    ],
    detailFields: []
  };
  handleConfig(config);
  return config;
}
