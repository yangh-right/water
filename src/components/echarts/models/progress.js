import { genGradient } from '../libs/utils';

const themeColor = {
  light: {
    colors: [
      '#4285F4',
      '#67C23A',
      '#4AACEE',
      '#ffc069',
      '#fd6865',
      '#6d7ee4',
      '#ff9c6e',
      '#81c785',
      '#b47fec',
      '#62a5f6',
      '#ff85c0',
    ],
    yAxis: ['#666', '#333'],
    series: ['#f5f5f5', '#fff'],
  },
  dark: {
    colors: [
      '#71a3f8',
      '#3366ff',
      '#3498fd',
      '#21d3f0',
      '#1f40c0',
      '#29dcb1',
      '#3cfb99',
      '#eae138',
      '#87ce40',
      '#adce00',
      '#1098ad',
    ],
    yAxis: ['#adb5bd', '#fff'],
    series: ['#282e34', '#20262f'],
  },
};

/**
 * @description: 生成进度柱状图配置
 * @param {*} dataset
 * @param {*} theme
 * @return {*}
 */
export function genProgressOptions(dataset, { theme }) {
  const color = themeColor[theme];

  let category = [];
  let data = [];
  if (dataset?.dimensions && dataset?.source) {
    dataset.source.forEach((v) => {
      category.push(v[dataset.dimensions[0]]);
      data.push(v[dataset.dimensions[1]]);
    });
  }

  let options = {
    color: color.colors.map((v) =>
      genGradient([
        [0, v],
        [1, v, 0.5],
      ])
    ),
    grid: {
      containLabel: false,
      top: 10,
      left: 10,
      right: 10,
      bottom: 10,
    },
    xAxis: [
      {
        type: 'value',
        axisPointer: {
          type: 'shadow',
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
      },
    ],
    yAxis: [
      {
        type: 'category',
        inverse: true,
        axisLabel: {
          verticalAlign: 'bottom',
          align: 'left',
          padding: [0, 10, 16, 12],
          textStyle: {
            fontSize: 16,
            color: color.yAxis[0],
          },
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        data: category,
      },
      {
        type: 'category',
        inverse: true,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: true,
          inside: false,
          verticalAlign: 'bottom',
          padding: [0, 0, 16, -50],
          textStyle: {
            fontSize: 18,
            color: color.yAxis[1],
          },
          formatter: function (value) {
            return value + '%';
          },
        },
        data,
      },
    ],
    series: [
      // 数据柱状图
      {
        type: 'bar',
        barWidth: 16,
        colorBy: 'data',
        label: {
          show: false,
        },
        data,
        z: 1,
      },
      // 背景柱状图
      {
        type: 'bar',
        barWidth: 16,
        barGap: '-100%',
        animation: false,
        silent: true,
        itemStyle: {
          normal: {
            borderWidth: 0,
            color: color.series[0],
          },
        },
        data: Array.from({ length: data.length }, () => 100),
        z: 0,
      },
      // 分割柱状图
      {
        type: 'pictorialBar',
        barWidth: 16,
        symbol: 'rect',
        symbolMargin: 7,
        symbolSize: [4, '100%'],
        symbolRepeat: true,
        animation: false,
        silent: true,
        itemStyle: {
          normal: {
            color: color.series[1],
          },
        },
        data: Array.from({ length: data.length }, () => 100),
        z: 2,
      },
    ],
  };

  return options;
}
