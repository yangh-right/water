import { isArray } from 'lodash-es';
import * as echarts from 'echarts/core';

/**
 * @description: 添加公共配置
 * @param {*} options
 * @param {*} dataset
 * @param {*} series
 * @return {*}
 */
function addCommonOptions(options, dataset, series) {
  let _series = series;

  if (dataset.dimensions && !Array.isArray(series)) {
    _series = Array.from({ length: dataset.dimensions.length - 1 }, () => series);
  }

  return {
    ...options,
    dataset: isArray(dataset) ? { source: dataset } : dataset,
    series: _series,
  };
}

/**
 * @description: 生成折线图基本配置
 * @param {*} dataset 如果是数组，则作为数据源添加；否则作为完整配置添加
 * @param {*} series
 * @return {*}
 */
export function genLineBaseOptions(dataset, series) {
  const options = {
    grid: {
      containLabel: true,
      top: 10,
      left: 20,
      right: 35,
      bottom: 50,
    },
    title: {
      show: false,
      left: 20,
      text: '',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
    },
    tooltip: {
      confine: true,
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
      textStyle: {
        fontSize: 10,
      },
      padding: 10,
      extraCssText: 'box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.10);',
    },
    legend: {
      type: 'scroll',
      bottom: 15,
    },
    xAxis: [
      {
        type: 'category',
        axisLabel: {
          fontSize: 12,
        },
        axisLine: {},
        splitLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
      },
    ],
    yAxis: [
      {
        nameTextStyle: {
          align: 'center',
        },
        type: 'value',
        position: 'left',
        axisLabel: {
          fontSize: 12,
        },
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
      },
    ],
  };
  return addCommonOptions(options, dataset, series);
}

/**
 * @description: 生成柱状图基本配置
 * @param {*} dataset
 * @param {*} series
 * @return {*}
 */
export function genBarBaseOptions(dataset, series) {
  let options = genLineBaseOptions(dataset, series);
  options.legend.itemWidth = 8;
  options.legend.itemHeight = 8;
  options.tooltip.axisPointer = {
    type: 'shadow',
    shadowStyle: {
      color: '#4285F4',
      opacity: 0.1,
    },
  };
  return options;
}

/**
 * @description: 生成饼图基本配置
 * @param {*} dataset
 * @param {*} series
 * @return {*}
 */
export function genPieBaseOptions(dataset, series) {
  const options = {
    title: {
      top: '45%',
      left: '25%',
      textAlign: 'center',
      textVerticalAlign: 'middle',
      itemGap: 12,
      padding: 0,
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
      },
      subtextStyle: {
        fontSize: 20,
      },
    },
    tooltip: {
      confine: true,
      axisPointer: {
        type: 'cross',
      },
      textStyle: {
        fontSize: 10,
      },
      formatter(params) {
        return `${params.name} : ${params.value.value} (${params.percent}%)`;
      },
      padding: 10,
      extraCssText: 'box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.10);',
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      top: 'middle',
      left: '70%',
      icon: 'rect',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 15,
      pageIconSize: 10,
      pageTextStyle: {
        fontSize: 12,
      },
      textStyle: {
        padding: [2, 0, 0, 0],
        fontSize: 12,
        lineHeight: 16,
      },
      formatter: function (name) {
        return echarts.format.truncateText(name, 175, '', '…');
      },
      tooltip: {
        show: true,
      },
    },
  };
  return addCommonOptions(options, dataset, series);
}

/**
 * @description: 生成雷达图基本配置
 * @return {*}
 */
export function genRadarBaseOptions(series) {
  const options = {
    tooltip: {
      confine: true,
      backgroundColor: '#fff',
      axisPointer: {
        type: 'cross',
        label: {
          color: '#666',
          backgroundColor: '#fff',
        },
      },
      textStyle: {
        fontSize: 10,
        color: '#666',
      },
      padding: 10,
      extraCssText: 'box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.10);',
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      top: 'middle',
      left: '70%',
      icon: 'rect',
      itemWidth: 20,
      itemHeight: 2,
      itemGap: 15,
      pageIconSize: 10,
      pageTextStyle: {
        fontSize: 12,
      },
      textStyle: {
        padding: [2, 0, 0, 0],
        fontSize: 12,
        lineHeight: 16,
      },
      formatter(params) {
        return params
          .split(/(.{7})/)
          .filter((v) => v)
          .join('\n');
      },
    },
    radar: [
      {
        // shape: "polygon",
        splitNumber: 3,
        center: ['35%', '50%'],
        radius: '71%',
        name: {
          textStyle: {
            fontSize: 12,
            color: '#999',
          },
        },
        nameGap: 12,
        indicator: [],
        splitLine: {
          show: true,
          lineStyle: {
            width: 1,
            color: '#DEE2E7',
          },
        },
        splitArea: {
          show: false,
        },
        axisLine: {
          lineStyle: {
            color: '#DEE2E7',
          },
        },
      },
    ],
  };
  return addCommonOptions(options, null, series);
}
