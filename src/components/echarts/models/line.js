import { genLineBaseOptions } from './base';

/**
 * @description: 生成折线图系列
 * @return {*}
 */
export function genLineSeries() {
  return {
    type: 'line',
    symbol: 'emptyCircle',
    symbolSize: 8,
    lineStyle: { width: 1 },
  };
}

/**
 * @description: 生成折线图配置
 * @param {*} dataset
 * @return {*}
 */
export function genLineOptions(dataset) {
  const series = genLineSeries();
  return genLineBaseOptions(dataset, series);
}

/**
 * @description: 生成折线面积图系列
 * @return {*}
 */
export function genLineAreaSeries() {
  return {
    ...genLineSeries(),
    symbol: 'circle',
    showSymbol: false,
    areaStyle: {
      opacity: 0.15,
    },
  };
}

/**
 * @description: 生成折线面积图配置
 * @param {*} dataset
 * @return {*}
 */
export function genLineAreaOptions(dataset) {
  const series = genLineAreaSeries();
  return genLineBaseOptions(dataset, series);
}

/**
 * @description: 生成平滑折线面积图系列
 * @return {*}
 */
export function genSmoothLineAreaSeries() {
  return {
    ...genLineAreaSeries(),
    smooth: true,
    itemStyle: {
      // color: colors[0].baseColor,
    },
    lineStyle: {
      opacity: 0,
    },
  };
}

/**
 * @description: 生成平滑折线面积图配置
 * @param {*} dataset
 * @return {*}
 */
export function genSmoothLineAreaOptions(dataset) {
  const series = genSmoothLineAreaSeries();
  return genLineBaseOptions(dataset, series);
}
