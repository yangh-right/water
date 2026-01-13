import { genBarBaseOptions } from './base';
import { axisReverse } from '../libs/utils';

/**
 * @description: 生成柱状图系列
 * @return {*}
 */
export function genBarSeries() {
  return {
    type: 'bar',
    barMaxWidth: 4,
    barGap: '100%',
    itemStyle: {
      borderRadius: [5, 5, 0, 0],
    },
  };
}

/**
 * @description: 生成柱状图配置
 * @param {*} dataset
 * @return {*}
 */
export function genBarOptions(dataset) {
  const series = genBarSeries();
  return genBarBaseOptions(dataset, series);
}

/**
 * @description: 生成堆叠柱状图系列
 * @return {*}
 */
export function genStackBarSeries() {
  return {
    type: 'bar',
    stack: 'default',
    barWidth: 5,
  };
}

/**
 * @description: 生成堆叠柱状图配置
 * @param {*} dataset
 * @return {*}
 */
export function genStackBarOptions(dataset) {
  const series = genStackBarSeries();
  return genBarBaseOptions(dataset, series);
}

/**
 * @description: 生成反转柱状图系列
 * @return {*}
 */
export function genReverseBarSeries() {
  return {
    type: 'bar',
    barWidth: 7,
    itemStyle: {
      color: '#4285F4',
      borderRadius: [0, 10, 10, 0],
    },
    backgroundStyle: {
      color: '#F5F5F5',
    },
  };
}

/**
 * @description: 生成反转柱状图配置
 * @param {*} dataset
 * @return {*}
 */
export function genReverseBarOptions(dataset) {
  const series = genReverseBarSeries();
  return axisReverse(genBarBaseOptions(dataset, series));
}

/**
 * @description: 生成反转堆叠柱状图系列
 * @return {*}
 */
export function genReverseStackBarSeries() {
  return {
    ...genStackBarSeries(),
  };
}

/**
 * @description: 生成反转堆叠柱状图配置
 * @param {*} dataset
 * @return {*}
 */
export function genReverseStackBarOptions(dataset) {
  const series = genReverseStackBarSeries();
  return axisReverse(genBarBaseOptions(dataset, series));
}

/* -------------------------------- 反转柱状图样式二 ---------------------------- */
/**
 * @description: 生成反转柱状图系列
 * @return {*}
 */
export function genReverseBarSeries2() {
  return {
    type: 'bar',
    barMaxWidth: 14,
    barGap: '50%',
  };
}

/**
 * @description: 生成反转柱状图配置
 * @param {*} dataset
 * @return {*}
 */
export function genReverseBarOptions2(dataset) {
  const series = genReverseBarSeries2();
  return axisReverse(genBarBaseOptions(dataset, series));
}
