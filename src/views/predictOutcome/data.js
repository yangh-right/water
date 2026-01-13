/*
 * @Author: duyibo
 * @Date: 2024-05-31 15:31:23
 * @LastEditors: Do not edit
 * @LastEditTime: 2024-06-27 11:24:31
 * @Description:
 */
export const courseList = [
  {
    label: '可变段COD',
    superiorCode: 'change',
    code: 'COD'
  },
  {
    label: '好氧中段COD',
    superiorCode: 'aerobic_tank_1',
    code: 'COD'
  },
  {
    label: '好氧末段COD',
    superiorCode: 'aerobic_tank_2',
    code: 'COD'
  },
  {
    label: '可变段NH₄⁺-N',
    superiorCode: 'change',
    code: 'NH3N'
  },
  {
    label: '好氧中段NH₄⁺-N',
    superiorCode: 'aerobic_tank_1',
    code: 'NH3N'
  },
  {
    label: '好氧末段NH₄⁺-N',
    superiorCode: 'aerobic_tank_2',
    code: 'NH3N'
  },
  {
    label: '可变段NO₃⁻-N',
    superiorCode: 'change',
    code: 'nitrate_nitrogen'
  },
  {
    label: '好氧中段NO₃⁻-N',
    superiorCode: 'aerobic_tank_1',
    code: 'nitrate_nitrogen'
  },
  {
    label: '好氧末段NO₃⁻-N',
    superiorCode: 'aerobic_tank_2',
    code: 'nitrate_nitrogen'
  },
  {
    label: '可变段TN',
    superiorCode: 'change',
    code: 'TN'
  },
  {
    label: '好氧中段TN',
    superiorCode: 'aerobic_tank_1',
    code: 'TN'
  },
  {
    label: '好氧末段TN',
    superiorCode: 'aerobic_tank_2',
    code: 'TN'
  },
  {
    label: '可变段TP',
    superiorCode: 'change',
    code: 'TP'
  },
  {
    label: '好氧中段TP',
    superiorCode: 'aerobic_tank_1',
    code: 'TP'
  },
  {
    label: '好氧末段TP',
    superiorCode: 'aerobic_tank_2',
    code: 'TP'
  },
  {
    label: '可变段PO4-3',
    superiorCode: 'change',
    code: 'PO4-P'
  },
  {
    label: '好氧中段PO4-3',
    superiorCode: 'aerobic_tank_1',
    code: 'PO4-P'
  },
  {
    label: '好氧末段PO4-3',
    superiorCode: 'aerobic_tank_2',
    code: 'PO4-P'
  }
];

export const waterList = [
  {
    label: 'COD',
    superiorCode: 'COD',
    code: 'COD',
    signedPv: 30
  },
  {
    label: 'TP',
    superiorCode: 'TP',
    code: 'TP',
    signedPv: 0.3
  },
  // {
  //   label: 'SS',
  //   superiorCode: 'SS',
  //   code: 'SS'
  // },
  {
    label: 'TN',
    superiorCode: 'TN',
    code: 'TN',
    signedPv: 12
  },

  {
    label: 'NH₃-N',
    superiorCode: 'NH3N',
    code: 'NH3N',
    signedPv: 1.5
  }
  // {
  //   label: '',
  //   superiorCode: '',
  //   code: '',
  //   flag: true
  // }
];

export function hexToRgba(hex, opacity) {
  return (
    'rgba(' +
    parseInt('0x' + hex.slice(1, 3)) +
    ',' +
    parseInt('0x' + hex.slice(3, 5)) +
    ',' +
    parseInt('0x' + hex.slice(5, 7)) +
    ',' +
    opacity +
    ')'
  );
}

const hexToRgb = hex => {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  // eslint-disable-next-line no-param-reassign
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  /* eslint-disable indent */
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
  /* eslint-enable */
};
export const color = ['#06B4FF', '#27DCB1', '#FF9A3B', '#800080'];
const rgb = hexToRgb(color[0]);
export const end = `rgba(${rgb.r},${rgb.g},${rgb.b},0)`;
