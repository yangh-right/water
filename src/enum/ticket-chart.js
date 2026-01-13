/*
 * @Author: yangliao
 * @Date: 2021-01-14 09:14:58
 * @LastEditTime: 2022-01-20 16:01:56
 * @LastEditors: yangyuzhi
 * @Description: 工单分析
 * @FilePath: /out-work-web/src/enum/ticket-chart.js
 */

// 统计指标--卡片
// 实时指标--处理中工单类型占比饼图
export const RealTicketTypeRatioPre = {
  columns: [
    { title: '来源', dataIndex: 'name', key: 'name', width: 160, visible: false },
    { title: '数量', dataIndex: 'value', key: 'value', width: 60, visible: false },
    { title: '占比', dataIndex: 'rate', key: 'rate', width: 60, visible: false }
  ],
  records: [],
  echart: {
    legend: {
      formatter: name => {
        let data = RealTicketTypeRatioPre.records;
        let item = {};
        data.forEach(v => {
          if (v.name === name) {
            item = v;
          }
        });
        let subName = name.length > 4 ? `${name.substr(0, 4)}...` : name;
        let arr = `{a|${subName}}{b|${item.value}}{c|${item.rate}}`;
        return arr;
      },
      textStyle: {
        rich: {
          a: {
            fontSize: 12,
            align: 'left',
            width: 70
          },
          b: {
            fontSize: 12,
            align: 'left',
            width: 50
          },
          c: {
            fontSize: 12,
            align: 'left',
            width: 50
          }
        }
      }
    },
    title: { text: '处理中工单总数', subtext: '' },
    series: [{ type: 'pie', cType: 'circlePie' }]
  },
  block: {
    blockName: '处理中工单类型占比',
    description: '各类型处理中工单的占比情况，包含工单类型和所属模板'
  },
  kpiId: 'RealPriorityRatio',
  zoom: true,
  openModal: true,
  spinning: true
}
