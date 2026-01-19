/*
 * @Author: duyibo
 * @Date: 2024-05-31 15:31:23
 * @LastEditors: Do not edit
 * @LastEditTime: 2024-06-27 11:24:31
 * @Description:
 */
export const courseList = [
  {
    label: 'COD',
    superiorCode: 'change',
    code: 'COD'
  },
  {
    label: 'TP',
    superiorCode: 'change',
    code: 'TP'
  },
  {
    label: 'TN',
    superiorCode: 'aerobic_tank_2',
    code: 'TN'
  },
  {
    label: 'NH₃-N',
    superiorCode: 'aerobic_tank_1',
    code: 'NH3N'
  }
];

export const waterList = [
  {
    label: 'COD',
    superiorCode: 'COD',
    code: 'COD',
    aliasName: 'COD',
    signedPv: 30,
    alertPv: 20,
    min: 0,
    max: 40
  },
  {
    label: 'TP',
    superiorCode: 'TP',
    code: 'TP',
    aliasName: 'TP',
    signedPv: 0.3,
    alertPv: 0.2,
    min: 0,
    max: 0.5
  },
  {
    label: 'TN',
    superiorCode: 'TN',
    code: 'TN',
    aliasName: 'TN',
    signedPv: 12,
    alertPv: 8,
    min: 0,
    max: 20
  },
  {
    label: 'NH₃-N',
    superiorCode: 'NH3N',
    code: 'NH3N',
    aliasName: 'NH3-N',
    signedPv: 1.5,
    alertPv: 0.5,
    min: 0,
    max: 2
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
