import * as echarts from 'echarts';


export function genOption(config = {}) {
  return {
    ...genCommonOption(config),
    color: ['#BD5DFF', '#FF9A3B'],
    series: [
      {
        name: '实际值',
        data: config.yData || [],
        type: 'line',
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colorRgb('#BD5DFF', 0.5) },
            { offset: 1, color: colorRgb('#BD5DFF', 0.1) }
          ])
        }
      }
    ]
  };
}

export function genCommonOption(config = {}) {
  return {
    grid: [
      {
        left: '16px',
        right: '12px',
        top: '40px',
        bottom: '12px',
        containLabel: true
      }
    ],
    legend: {
      show: true,
      top: 6,
      right: 6,
      icon: 'rect',
      itemHeight: 2,
      itemWidth: 12
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: [
      {
        axisLabel: {
          rotate: config.xAxisRotate ?? 0,
          formatter: config.xAxisLabelFormat
        },
        axisLine: {
          show: false,
          lineStyle: {
            // color: "#354050"
          }
        },
        data: config.xData || []
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: config.yAxisName || '',
        splitLine: {
          lineStyle: {
            // color: '#141618'
          }
        },
        axisLabel: {
          // color: '#8C99A6'
        },
        nameTextStyle: {
          align: 'right'
          // color: '#8C99A6',
        }
      }
    ]
  };
}

export function colorRgb(str, opacity) {
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