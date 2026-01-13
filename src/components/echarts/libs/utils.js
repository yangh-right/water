/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-02-13 10:11:47
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-02-13 11:35:18
 * @Description:
 */
import { isString, isArray } from 'lodash-es';

export { toNum, getBaseTheme } from '@/utils/util';

/**
 * @description: 坐标轴反转
 * @param {*} options
 * @return {*}
 */
export function axisReverse(options) {
  let _options = { ...options };
  [_options.xAxis, _options.yAxis] = [_options.yAxis, _options.xAxis];
  // 反转Y轴
  _options.yAxis?.forEach(v => {
    v.inverse = true;
  });
  return _options;
}

/**
 * @description: 生成渐变色配置
 * @param {*} colors 渐变颜色：[[0, '#fff', 1], [1, '#000', 0.5]]->[[位置, 色值, 透明度(非必传)]]
 * @param {*} direction 渐变方向：
 *                      线性渐变：'x'->横向, 'y'->纵向, [0, 0, 1, 0]->自定义配置
 *                      径向渐变：[0.5, 0.5, 0.5]->自定义配置
 * @param {*} type 渐变类型：'l'->线性渐变, 'r'->径向渐变, 默认为线性渐变
 * @return {*}
 */
export function genGradient(colors, direction, type = 'l') {
  const _type = type === 'r' ? 'radial' : 'linear';

  let _colors = [];
  if (colors?.length) {
    _colors = colors.map(v => {
      return { offset: v[0], color: v[1] };
    });
  }

  let _direction = [];
  if (_type === 'linear') {
    _direction = [0, 0, 1, 0];
    if (isString(direction) && direction === 'y') {
      _direction = [0, 0, 0, 1];
    } else if (isArray(direction)) {
      _direction = direction;
    }

    _direction = {
      x: _direction[0],
      y: _direction[1],
      x2: _direction[2],
      y2: _direction[3]
    };
  } else if (_type === 'radial') {
    _direction = isArray(direction) ? direction : [0.5, 0.5, 0.5];
    _direction = {
      x: _direction[0],
      y: _direction[1],
      r: _direction[2]
    };
  }

  return {
    type: _type,
    ..._direction,
    colorStops: _colors,
    global: false
  };
}
