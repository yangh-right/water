/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-08-07 09:59:21
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-08-07 10:52:49
 * @Description:
 */
export const deviceOption = {
  color: [
    '#2F7FFF',
    '#FF6781',
    '#28D6FE',
    '#FFA66D',
    '#2BDEAB',
    '#FFD739',
    '#A259F5',
    '#F9D54A',
    '#0171CE'
  ],
  tooltip: {
    trigger: 'item'
  },
  title: {
    text: '232',
    left: 'center',
    top: '34%',
    textStyle: {
      align: 'center',
      color: '#333',
      fontSize: 24,
      fontWeight: 600
    },
    subtext: '设备总数',
    //padding:0,
    subtextStyle: {
      align: 'center',
      color: '#999',
      fontSize: 14,
    },
  },
  legend: {
    show: false
  },
  series: [
    {
      type: 'pie',
      radius: ['70%', '90%'],
      roseType: false,
      avoidLabelOverlap: true,
      label: {
        show: false,
        // position: 'center',
        // formatter: '{name|{c}}{unit|次}\n{value|{b}}',
        // rich: {
        //   name: { fontSize: 24, color: '#333333', fontWeight: 500 },
        //   unit: { fontSize: 12, color: '#999999' },
        //   value: { fontSize: 14, color: '#999999' }
        // }
      },
      emphasis: {
        label: {
          show: false,
          color: '#13E0FF',
          fontSize: 22,
          fontWeight: 600
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { name: '设备运行', value: 125 },
        { name: '故障设备', value: 8 },
        { name: '停机设备', value: 13 },
        { name: '维修设备', value: 24 }
      ]
    }
  ]
};
