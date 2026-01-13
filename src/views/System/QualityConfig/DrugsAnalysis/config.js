import { transMoneyNumber } from '@/utils/util';
import * as echarts from 'echarts';
export const pieOption = {
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c}元 ({d}%)'
  },
  grid: {},
  legend: {
    right: '10%',
    orient: 'vertical',
    top: 'center',
    left: 'right',
    align: 'left',
    itemGap: 15,
    itemWidth: 10,
    itemHeight: 10,
    icon: 'rect',
    type: 'scroll',
    symbolKeepAspect: false,
    formatter: function(name, val) {
      let data = pieOption.series[0].data;
      let total = 0;
      let tarValue;
      for (let i = 0; i < data.length; i++) {
        total += data[i].value;
        if (data[i].name == name) {
          tarValue = data[i].value;
        }
      }
      let v = transMoneyNumber(tarValue) + '元';
      let p = ((tarValue / total) * 100).toFixed(2) + '%';
      return `${name}  ${v}  ${p}`;
    }
  },
  series: [
    {
      name: '',
      type: 'pie',
      radius: ['60%', '70%'],
      right: '55%',
      label: {
        show: false,
        position: 'center'
      },
      labelLine: {
        show: false
      },
      data: []
    }
  ]
};
export const drugConsumptionline = {
  grid: [
    {
      left: '16px',
      right: '12px',
      top: '15%',
      bottom: '15%',
      containLabel: true
    }
  ],
  color: ['#5B8FF9', '#61DDAA', '#FF922B'],
  legend: {
    show: false,
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12,
    textStyle: {
      fontSize: '12px',
      color: '#000000'
    }
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: [
    {
      data: ['00:00', '06:00', '12:00', '18:00', '24:00']
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: '%',
      nameTextStyle: {
        color: '#00000073',
        align: 'right'
      }
    }
  ],
  series: [
    {
      name: '去除率',
      data: [20, 28, 37, 38, 130],
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colorRgb('#709BF1', 0.8) },
          { offset: 1, color: colorRgb('#c1dffd', 0.1) }
        ])
      },
      type: 'line',
      smooth: true
    }
  ]
};
// 智能预测
export const forecastColumn = [
  {
    title: '药剂名称',
    dataIndex: 'materielName',
    ellipsis: true
  },
  {
    dataIndex: 'existingQuantity',
    ellipsis: true,
    customRender(text, row) {
      if (row?.unit) {
        return text + ' ' + row.unit;
      }
      return '--';
    },
    slots: { title: 'customTitle', customRender: 'num' }
  },
  {
    title: '库存阈值',
    dataIndex: 'minInventory',
    ellipsis: true,
    customRender(text, row) {
      if (row?.unit) {
        return text + ' ' + row.unit;
      }
      return '--';
    }
  },
  {
    title: '历史药耗（单日）',
    dataIndex: 'historicalDrugConsumption',
    ellipsis: true,
    customRender(text, row) {
      if (row?.unit) {
        return text + ' ' + row.unit;
      }
      return '--';
    }
  },
  {
    title: '建议入库日期',
    dataIndex: 'suggestWarehousingDate',
    ellipsis: true
  },
  {
    title: '建议入库数量',
    dataIndex: 'suggestWarehousingNum',
    ellipsis: true,
    customRender(text, row) {
      if (row?.unit) {
        return text + ' ' + row.unit;
      }
      return '--';
    }
  }
];

function colorRgb(str, opacity) {
  let sColor = str.toLowerCase();
  if (sColor) {
    if (sColor.length === 4) {
      let sColorNew = '#';
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      }
      sColor = sColorNew;
    }
    //处理六位的颜色值
    let sColorChange = [];
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
    }
    return 'rgba(' + sColorChange.join(',') + ',' + opacity + ')';
  } else {
    return sColor;
  }
}
