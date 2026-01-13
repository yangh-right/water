//     case 'pictorialBar':
//       obj = {
//         type: 'bar',
//         cType: 'pictorialBar',
//       };
//       break;
//     case 'cloud':
//       obj = {
//         type: 'word-cloud',
//         cType: 'word-cloud',
//       };
//       break;
//     case 'nestedCake':
//       obj = {
//         type: 'pie',
//         cType: 'nestedCake',
//       };
//       break;
//     case 'doubleBar':
//       obj = {
//         type: 'bar',
//         cType: 'doubleBar',
//       };
//       break;

import * as api from '../models';

/**
 * @description: 图表api
 * @return {*}
 */
export const chartApi = {
  line: api.genLineOptions,
  lineArea: api.genLineAreaOptions,
  smoothAreaLine: api.genSmoothLineAreaOptions,

  bar: api.genBarOptions,
  stackBar: api.genStackBarOptions,
  side: api.genReverseBarOptions,
  top: api.genReverseBarOptions,
  columnar: api.genReverseStackBarOptions,
  reverseBar2: api.genReverseBarOptions2,
  progress: api.genProgressOptions,

  cake: api.genPieOptions,
  hollowCake: api.genCirclePieOptions,
  rose: api.genRosePieOptions,

  radar: api.genRadarOptions,

  gauge: api.genGaugeOptions,

  // table: api.genTableOptions,
};

/**
 * @description: 检测图表类型
 * @param {*} rawType
 * @return {*}
 */
export function checkChartType(rawType) {
  if (['line', 'lineArea', 'smoothAreaLine'].includes(rawType)) {
    return 'line';
  }
  if (['bar', 'stackBar', 'side', 'top', 'columnar', 'reverseBar2'].includes(rawType)) {
    return 'bar';
  }
  if (['cake', 'rose', 'hollowCake'].includes(rawType)) {
    return 'pie';
  }
  return rawType;
}

/**
 * @description: 仪表盘样式
 * @return {*}
 */
export const gaugeType = {
  light: 'dividingPanel',
  dark: ['solidPanel', 'metalPanel', 'linePanel-red', 'dividingPanel'],
};
