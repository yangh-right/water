import moment from 'moment';
import * as echarts from 'echarts';
// 格式化数值，保留1位小数
const formatNumber = num => {
  return parseFloat(num.toFixed(1));
};
export function getOutWaterQualityOption(config = {}) {
  let color = ['#28A8F3', '#00cc9d', '#febe1c', '#F194F4'];

  // 构建警戒线数据
  const markLineData = [];
  let maxWarningValue = 0;

  // 收集警戒线的值用于计算 y 轴范围
  if (config.gb !== null && config.gb !== 0) {
    markLineData.push({
      name: '设计',
      yAxis: config.gb,
      lineStyle: {
        type: 'dashed',
        width: 2,
        color: '#febe1c'
      },
      label: {
        position: 'start',
        offset: [10, 0],
        formatter: `设计 {c}`,
        align: 'left',
        color: '#FE5F34'
      }
    });
    maxWarningValue = Math.max(maxWarningValue, config.gb);
  }

  if (config.cb !== null && config.cb !== 0) {
    markLineData.push({
      name: '内控',
      yAxis: config.cb,
      lineStyle: {
        type: 'dashed',
        width: 2,
        color: '#F194F4'
      },
      label: {
        position: 'start',
        offset: [10, 0], // 调整第二条线的标签位置，避免重叠
        formatter: `内控 {c}`,
        align: 'left',
        color: '#EFFC34'
      }
    });
    maxWarningValue = Math.max(maxWarningValue, config.cb);
  }

  // 计算数据的最大值
  const seriesData = config.data || [];
  const maxDataValue = Math.max(...seriesData.map(item => Number(item) || 0));

  // 计算 y 轴的最大值，确保警戒线和数据都能显示
  const yAxisMax = formatNumber(Math.max(maxWarningValue, maxDataValue) * 1.2); // 留出20%的空间
  const yAxisMin = 0; // 从0开始

  let option = {
    color: config.color || color,
    grid: [
      {
        left: '3%',
        right: '3%',
        top: '18%',
        bottom: '4%'
      }
    ],
    legend: {
      show: true,
      data: [],
      itemWidth: 16,
      itemHeight: 8,
      right: 0,
      textStyle: {
        color: '#666666',
        fontWeight: 400,
        fontSize: 12
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: [
      {
        data: config.xData || []
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: 'mg/L',
        nameTextStyle: {
          color: '#00000073',
          align: 'right'
        },
        min: yAxisMin,
        max: yAxisMax,
        axisTick: { show: false },
        axisLabel: {
          show: true,
          interval: 0,
          formatter: '{value}'
        },
        splitLine: { lineStyle: { type: 'solid' } }
      }
    ],
    series: [
      {
        type: 'line',
        name: '',
        data: [],
        barWidth: '10',
        emphasis: {
          itemStyle: {
            borderRadius: 10
          }
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {
            width: 1
          },
          emphasis: {
            disabled: true
          },
          label: {
            show: true,
            position: 'insideEndTop',
            distance: 10,
            color: '#bfd5ff',
            fontSize: 12,
            backgroundColor: 'rgba(0,16,47,0.8)',
            padding: [2, 4],
            formatter: '{c} mg/L'
          },
          data: markLineData
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colorRgb(color[0], 0.2) },
            { offset: 1, color: colorRgb(color[0], 0) }
          ])
        }
      },
      {
        type: 'line',
        name: '',
        symbol: 'circle',
        symbolSize: 0,
        data: [],
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: colorRgb(color[1], 0.2) },
            { offset: 1, color: colorRgb(color[1], 0) }
          ])
        }
      }
    ]
  };
  return option;
}

export function colorRgb(str, opacity) {
  var sColor = str.toLowerCase();
  if (sColor) {
    if (sColor.length === 4) {
      var sColorNew = '#';
      for (var i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      }
      sColor = sColorNew;
    }
    //处理六位的颜色值
    var sColorChange = [];
    for (var i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
    }
    return 'rgba(' + sColorChange.join(',') + ',' + opacity + ')';
  } else {
    return sColor;
  }
}
export function getDateRange(type) {
  let endDate = moment().format('YYYY-MM-DD');
  let startDate;
  if (type === 'year') {
    startDate = moment()
      .startOf('year')
      .format('YYYY-MM-DD');
  } else if (type === 'month') {
    startDate = moment()
      .startOf('month')
      .format('YYYY-MM-DD');
  } else if (type === 'day') {
    startDate = moment()
      .startOf('day')
      .format('YYYY-MM-DD');
  }
  return {
    endDate,
    startDate
  };
}
export function formatDate(date, type) {
  if (!date) return '';
  switch (type) {
    case 'day':
      return moment(date).format('HH:00');
    case 'month':
      return moment(date).format('MM-DD');
    case 'year':
      return moment(date).format('MM');
    default:
      return date;
  }
}
