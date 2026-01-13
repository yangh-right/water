import { genRadarBaseOptions } from './base';

/**
 * @description: 生成雷达图系列
 * @return {*}
 */
export function genRadarSeries() {
  return {
    type: 'radar',
    symbol: 'circle',
    symbolSize: 6,
  };
}

/**
 * @description: 生成雷达图配置
 * @param {*} dataset
 * @return {*}
 */
export function genRadarOptions(dataset) {
  const series = genRadarSeries();

  // 雷达图数据series内置
  const data = dataset.source.map((v, i) => ({ name: `系列${i + 1}`, value: Object.values(v) }));
  series.data = data;

  // 添加indicator
  let options = genRadarBaseOptions(series);
  const max = Math.max(...dataset.source.map((v) => Math.max(...Object.values(v))));
  const indicator = dataset.dimensions.map((v) => ({ name: v, max }));
  options.radar[0].indicator = indicator;

  return options;
}
