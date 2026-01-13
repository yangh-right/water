import { handleConfig } from '@/components/SearchTable/util';
export function getDangerConfig(_this) {
  const config = {
    searchFields: [
      {
        name: 'date',
        type: 'range-picker',
        attrs: {
          allowClear: false
        },
        placeholder: ['开始时间', '结束时间'],
        label: '时间范围'
      }
    ],
    initColumns: [
      {
        title: '序号',
        dataIndex: 'num',
        key: 'num',
        customRender: (text, row, index) => {
          return row && row._isSummary ? '合计' : index + 1;
        }
      },
      { dataIndex: 'flowPv', title: '	水耗(元)' },
      { dataIndex: 'flow', title: '	水量(吨)' },
      { dataIndex: 'powerPv', title: '电耗(元)' },
      { dataIndex: 'power', title: '电量(kW·h)' },
      { dataIndex: 'dosagePv', title: '药耗(元)' },
      { dataIndex: 'dosage', title: '药量(吨)' },
      { dataIndex: 'sludgePv', title: '污泥外运费(元)' },
      { dataIndex: 'sludge', title: '污泥外运量(吨)' },
      { dataIndex: 'pacPv', title: 'PAC费用(元)' },
      { dataIndex: 'pac', title: 'PAC量(吨)' },
      { dataIndex: 'sodiumAcetatePv', title: '乙酸钠费用(元)' },
      { dataIndex: 'sodiumAcetate', title: '乙酸钠量(吨)' },
      { dataIndex: 'sodiumHypochloritePv', title: '次氯酸钠费用(元)' },
      { dataIndex: 'sodiumHypochlorite', title: '次氯酸钠量(吨)' },
      { dataIndex: 'time', title: '日期' }
    ],
    detailFields: []
  };
  handleConfig(config);
  return config;
}
