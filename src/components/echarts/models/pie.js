import { genPieBaseOptions } from './base';
import { toNum } from '../libs/utils';

/**
 * @description: 生成饼图系列
 * @return {*}
 */
export function genPieSeries() {
  return {
    type: 'pie',
    center: ['35%', '50%'],
    label: {
      show: false,
    },
    labelLine: {
      show: false,
    },
  };
}

/**
 * @description: 生成饼图配置
 * @param {*} dataset
 * @return {*}
 */
export function genPieOptions(dataset) {
  const series = genPieSeries();
  return genPieBaseOptions(dataset, series);
}

/**
 * @description: 生成环形图系列
 * @return {*}
 */
export function genCirclePieSeries() {
  return {
    type: 'pie',
    center: ['35%', '50%'],
    radius: ['50%', '70%'],
    label: {
      show: false,
      position: 'center',
    },
  };
}

/**
 * @description: 生成环形图配置
 * @param {*} dataset
 * @return {*}
 */
export function genCirclePieOptions(dataset) {
  const series = genCirclePieSeries();
  let options = genPieBaseOptions(dataset, series);

  options.title.left = '35%';
  options.title.text = '总数';
  options.title.subtext = String(
    options.dataset.source.reduce((s, a) => NP.plus(s, toNum(a.value, 0)), 0)
  );

  return options;
}

/**
 * @description: 生成玫瑰图系列
 * @return {*}
 */
export function genRosePieSeries() {
  return {
    type: 'pie',
    center: ['35%', '50%'],
    radius: ['25%', '70%'],
    roseType: 'area',
    label: {
      show: false,
      position: 'center',
    },
    labelLine: {
      show: false,
    },
  };
}

/**
 * @description: 生成玫瑰图配置
 * @param {*} dataset
 * @return {*}
 */
export function genRosePieOptions(dataset) {
  const series = genRosePieSeries();
  let options = genPieBaseOptions(dataset, series);

  options.title.left = '35%';

  return options;
}
