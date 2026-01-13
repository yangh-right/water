/**
 * @description: 生成仪表盘配置
 * @param {*} dataset
 * @param {*} type  正数为亮色主题，负数为暗色主题；亮色主题目前有三种，暗色主题目前有四种
 * @param {*} size
 * @return {*}
 */
export function genGaugeOptions(dataset, { type, size }) {
  if (type > 0 || type === -1) {
    return genDividingGauge(dataset[0], type, size);
  } else if (type === -2) {
    return genSolidGauge(dataset[0]);
  } else if (type === -3) {
    return genMetalGauge(dataset[0]);
  } else if (type === -4) {
    return genLineGauge(dataset[0]);
  }
}

/**
 * @description: 获取图片叠底
 * @param {*} image
 * @param {*} size
 * @return {*}
 */
function getImage(image, size) {
  // let cvs = document.createElement('canvas');
  // let ctx = cvs.getContext('2d');

  // if (image && size.w > 0 && size.h > 0) {
  //   cvs.width = size.w;
  //   cvs.height = size.h;

  //   let img = new Image();
  //   img.onload = function () {
  //     ctx.drawImage(img, 0, 0, size.w, size.h);
  //   };
  //   img.src = image;
  // }

  // return cvs;

  // 宽高定死250，与图片一致
  let img = new Image();
  img.src = image;
  return img;
}

/**
 * @description: 计算角度
 * @param {*} offset
 * @param {*} ratio
 * @return {*}
 */
function calcAngle(offset, ratio) {
  const midAngle = 270;
  let angle = {
    startAngle: midAngle - offset,
    endAngle: midAngle + offset - 360,
    totalAngle: 360 - 2 * offset,
  };
  angle.curAngle = angle.startAngle - angle.totalAngle * ratio;
  return angle;
}

/**
 * @description: 生成dividing样式仪表盘
 * @param {*} data
 * @param {*} type
 * @param {*} size
 * @return {*}
 */
function genDividingGauge(data, type, size) {
  const split = 30;
  const axisWidth = 16;
  const lineWidth = 3;
  const fontSize = 26;
  let ratio = (data.value - data.min) / (data.max - data.min);
  ratio = Math.max(Math.min(ratio, 1), 0); // 值限定为 0-1
  const { startAngle, endAngle, curAngle } = calcAngle(55, ratio);
  const img = getImage(require(`@/assets/panel/panel_bg${Math.abs(type)}.png`), size);

  let color;
  if (type > 0) {
    color = {
      titleColor: '#4A4A4A',
      unitColor: '#999',
      bigTickColor: '#EFF2F6',
      smallTickColor: '#E6ECF5',
      labelColor: '#C3CDDB',
    };
  } else {
    color = {
      titleColor: '#FFFFFF',
      unitColor: '#999',
      bigTickColor: '#373D4A',
      smallTickColor: '#495162',
      labelColor: '#C3CDDB',
    };
  }

  let series = [];

  // 彩色圆盘
  series.push({
    name: data.name,
    type: 'gauge',
    radius: '90%',
    startAngle: startAngle,
    endAngle: curAngle,
    splitNumber: 1,
    title: { show: false, offsetCenter: [0, '30%'], fontSize: 14 },
    axisLine: {
      show: false,
      lineStyle: {
        width: axisWidth,
        opacity: 0,
      },
    },
    splitLine: { show: false },
    axisTick: {
      length: axisWidth,
      splitNumber: Math.floor(ratio * split) + 1,
      lineStyle: {
        color: {
          image: img,
          repeat: 'no-repeat',
        },
        width: lineWidth,
      },
    },
    axisLabel: { show: false },
    pointer: { show: false },
    itemStyle: {},
    detail: {
      valueAnimation: true,
      color: color.titleColor,
      fontSize: fontSize,
      fontFamily: 'PingFangSC-Medium',
      offsetCenter: [0, '0%'],
      formatter: function (v) {
        return v + `\n{unit|${data.unit ? data.unit : ''}}`;
      },
      rich: {
        unit: {
          fontSize: 10,
          color: color.unitColor,
          lineHeight: 18,
        },
      },
      value: data.value,
    },
    data: [
      {
        value: data.value,
        name: data.name,
      },
    ],
  });
  // 大灰色圆盘
  series.push({
    name: '',
    radius: '90%',
    type: 'gauge',
    startAngle: curAngle,
    endAngle: endAngle,
    splitNumber: 1,
    axisLine: {
      show: false,
      lineStyle: {
        width: axisWidth,
        opacity: 0,
      },
    },
    splitLine: { show: false },
    axisTick: {
      length: axisWidth,
      splitNumber: split - Math.floor(ratio * split),
      lineStyle: {
        color: color.bigTickColor,
        width: lineWidth,
      },
    },
    axisLabel: { show: false },
    pointer: { show: false },
    itemStyle: {},
    title: { show: false },
    detail: { show: false },
  });
  // 小灰色圆盘
  series.push({
    name: '',
    radius: '72%',
    type: 'gauge',
    startAngle: startAngle,
    endAngle: endAngle,
    splitNumber: 2,
    axisLine: {
      show: false,
      lineStyle: {
        width: axisWidth,
        opacity: 0,
      },
    },
    splitLine: { show: false },
    axisTick: {
      length: 5,
      splitNumber: split / 2,
      lineStyle: {
        color: color.smallTickColor,
        width: lineWidth - 1,
      },
    },
    axisLabel: {
      show: true,
      color: color.labelColor,
      fontSize: 10,
      fontFamily: 'PingFangSC-Regular',
      formatter: function (value) {
        return data.min + ((data.max - data.min) * value) / 100;
      },
    },
    pointer: { show: false },
    itemStyle: {},
    title: { show: false },
    detail: { show: false },
  });
  // 末尾指针
  series.push({
    type: 'gauge',
    radius: '98%',
    startAngle: curAngle,
    endAngle: curAngle,
    splitNumber: 1,
    axisLine: {
      show: false,
      lineStyle: {
        width: axisWidth,
        opacity: 0,
      },
    },
    title: { show: false },
    detail: { show: false },
    splitLine: { show: false },
    axisTick: {
      length: axisWidth + 10,
      splitNumber: 1,
      lineStyle: {
        color: {
          image: img,
          repeat: 'no-repeat',
        },
        width: lineWidth,
      },
    },
    axisLabel: { show: false },
    pointer: { show: false },
    itemStyle: {},
    data: [
      {
        value: data.value,
        name: data.name,
      },
    ],
  });
  return {
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%',
    },
    series,
  };
}

/**
 * @description: 生成solid样式仪表盘
 * @param {*} data
 * @return {*}
 */
function genSolidGauge(data) {
  const split = 60;
  const axisWidth = 13;
  const fontSize = 20;
  const lineWidth = 1;
  let ratio = (data.value - data.min) / (data.max - data.min);
  ratio = Math.max(Math.min(ratio, 1), 0); // 值限定为 0-1
  const { startAngle, endAngle, curAngle } = calcAngle(35, ratio);

  let color = {
    titleColor: '#5DD8FE ',
    unitColor: '#C3CDDB',
    bigTickColor: '#373D4A',
    tickColor: '#5DD7FD', // 圆盘才色
    tipTickColor: '#5DD8FE', // 指针颜色
    labelColor: '#C3CDDB',
  };

  let series = [];
  // 小灰色圆盘
  series.push({
    name: '',
    radius: '65%',
    type: 'gauge',
    startAngle: startAngle,
    endAngle: endAngle,
    splitNumber: 2,
    axisLine: {
      show: false,
      lineStyle: {
        width: axisWidth,
        opacity: 0,
      },
    },
    splitLine: { show: false },
    axisTick: {
      show: false,
      length: 5,
      splitNumber: split / 2,
      lineStyle: {
        color: color.smallTickColor,
        width: lineWidth - 1,
      },
    },
    axisLabel: {
      show: true,
      color: color.labelColor,
      fontSize: 10,
      fontFamily: 'PingFangSC-Regular',
      formatter: function (value) {
        return data.min + ((data.max - data.min) * value) / 100;
      },
    },
    pointer: { show: false },
    itemStyle: {},
    title: { show: false },
    detail: { show: false },
  });
  // 彩色圆盘
  series.push({
    name: data.name,
    type: 'gauge',
    radius: '68%',
    startAngle: startAngle,
    endAngle: curAngle,
    splitNumber: 1,
    title: { show: false },
    // 轴线样式
    axisLine: {
      show: false,
      lineStyle: {
        width: axisWidth,
        opacity: 0,
      },
    },
    // 分段样式
    splitLine: { show: false },
    // 刻度样式
    axisTick: {
      length: axisWidth,
      splitNumber: Math.floor(ratio * split),
      lineStyle: {
        color: color.tickColor,
        width: lineWidth,
      },
    },
    axisLabel: { show: false },
    pointer: { show: false },
    // 指针样式
    itemStyle: {},
    detail: {
      valueAnimation: true,
      color: color.titleColor,
      fontSize: fontSize,
      fontFamily: 'PingFangSC-Medium',
      offsetCenter: [0, '5%'],
      formatter: function (v) {
        return v + `\n{unit|${data.unit ? data.unit : ''}}`;
      },
      rich: {
        unit: {
          fontSize: 10,
          color: color.unitColor,
          lineHeight: 18,
        },
      },
      value: data.value,
    },
    data: [
      {
        value: data.value,
        name: data.name,
      },
    ],
  });
  // 大灰色圆盘
  series.push({
    name: '',
    radius: '68%',
    type: 'gauge',
    startAngle: curAngle,
    endAngle: endAngle,
    splitNumber: 1,
    axisLine: {
      show: false,
      lineStyle: {
        width: axisWidth,
        opacity: 0,
      },
    },
    splitLine: { show: false },
    axisTick: {
      length: axisWidth,
      splitNumber: split - Math.floor(ratio * split),
      lineStyle: {
        color: color.bigTickColor,
        width: lineWidth,
      },
    },
    axisLabel: { show: false },
    pointer: { show: false },
    // 指针样式
    itemStyle: {},
    title: { show: false },
    detail: { show: false },
  });

  // 末尾指针
  series.push({
    type: 'gauge',
    radius: '68%',
    startAngle: curAngle,
    endAngle: curAngle,
    splitNumber: 1,
    axisLine: {
      show: false,
      lineStyle: {
        width: axisWidth,
        opacity: 0,
      },
    },
    title: { show: false },
    detail: { show: false },
    splitLine: { show: false },
    axisTick: {
      length: axisWidth,
      splitNumber: 1,
      lineStyle: {
        color: color.tipTickColor,
        width: lineWidth + 1,
      },
    },
    axisLabel: { show: false },
    pointer: { show: false },
    itemStyle: {},
    data: [
      {
        value: data.value,
        name: data.name,
      },
    ],
  });
  return {
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%',
    },
    backgroundColor: 'transparent',
    series,
  };
}

/**
 * @description: 生成metal样式仪表盘
 * @param {*} data
 * @return {*}
 */
function genMetalGauge(data) {
  const split = 60;
  const axisWidth = 13;
  const fontSize = 20;
  const lineWidth = 1;
  let ratio = (data.value - data.min) / (data.max - data.min);
  ratio = Math.max(Math.min(ratio, 1), 0); // 值限定为 0-1
  const { startAngle, endAngle, curAngle } = calcAngle(35, ratio);

  let color = {
    titleColor: '#5DD8FE ',
    unitColor: '#C3CDDB',
    bigTickColor: '#373D4A',
    tickColor: '#5DD7FD', // 圆盘才色
    tipTickColor: '#5DD8FE', // 指针颜色
    labelColor: '#C3CDDB',
  };

  let series = [];

  // 小灰色圆盘
  series.push({
    name: '',
    radius: '63%',
    type: 'gauge',
    startAngle: startAngle,
    endAngle: endAngle,
    splitNumber: 2,
    axisLine: {
      show: false,
      lineStyle: {
        width: axisWidth,
        opacity: 0,
      },
    },
    splitLine: { show: false },
    axisTick: {
      show: false,
      length: 5,
      splitNumber: split / 2,
      lineStyle: {
        color: color.smallTickColor,
        width: lineWidth - 1,
      },
    },
    axisLabel: {
      show: true,
      color: color.labelColor,
      fontSize: 10,
      fontFamily: 'PingFangSC-Regular',
      formatter: function (value) {
        return data.min + ((data.max - data.min) * value) / 100;
      },
    },
    pointer: { show: false },
    itemStyle: {},
    title: { show: false },
    detail: { show: false },
  });
  // 彩色圆盘
  series.push({
    name: data.name,
    type: 'gauge',
    radius: '49%',
    startAngle: startAngle,
    endAngle: curAngle,
    splitNumber: 1,
    title: { show: false },
    // 轴线样式
    axisLine: {
      show: true,
      lineStyle: {
        width: 2,
        color: [[1, '#52D6FF']],
        shadowColor: '#54D6FF',
        shadowBlur: 3,
        shadowOffsetX: 2,
        shadowOffsetY: 0,
      },
    },
    // 分段样式
    splitLine: { show: false },
    // 刻度样式
    axisTick: {
      show: false,
      length: axisWidth,
      splitNumber: Math.floor(ratio * split),
      lineStyle: {
        color: color.tickColor,
        width: lineWidth + 1,
      },
    },
    axisLabel: { show: false },
    pointer: { show: false },
    // 指针样式
    itemStyle: {},
    detail: {
      valueAnimation: true,
      color: color.titleColor,
      fontSize: fontSize,
      fontFamily: 'PingFangSC-Medium',
      offsetCenter: [0, '8%'],
      formatter: function (v) {
        return v + `\n{unit|${data.unit ? data.unit : ''}}`;
      },
      rich: {
        unit: {
          fontSize: 10,
          color: color.unitColor,
          lineHeight: 18,
        },
      },
      value: data.value,
    },
    data: [
      {
        value: data.value,
        name: data.name,
      },
    ],
  });
  // 末尾指针
  series.push({
    type: 'gauge',
    radius: '66%',
    startAngle: curAngle,
    endAngle: curAngle,
    splitNumber: 1,
    axisLine: {
      show: false,
      lineStyle: {
        width: axisWidth,
        opacity: 0,
      },
    },
    title: { show: false },
    detail: { show: false },
    splitLine: { show: false },
    axisTick: {
      length: axisWidth,
      splitNumber: 1,
      lineStyle: {
        color: color.tipTickColor,
        width: lineWidth,
      },
    },
    axisLabel: { show: false },
    pointer: { show: false },
    itemStyle: {},
    data: [
      {
        value: '',
        name: '',
      },
    ],
  });
  return {
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%',
    },
    backgroundColor: 'transparent',
    series,
  };
}

/**
 * @description: 生成line样式仪表盘
 * @param {*} data
 * @return {*}
 */
function genLineGauge(data) {
  const split = 60;
  const axisWidth = 13;
  const fontSize = 26;
  const lineWidth = 1;
  let ratio = (data.value - data.min) / (data.max - data.min);
  ratio = Math.max(Math.min(ratio, 1), 0); // 值限定为 0-1
  const { startAngle, endAngle, curAngle } = calcAngle(40, ratio);

  let color = {
    titleColor: '#FFFFFF',
    unitColor: '#C3CDDB',
    bigTickColor: '#373D4A',
    tickColor: '#5DD7FD', // 圆盘才色
    tipTickColor: '#46D7FF', // 指针颜色
    labelColor: '#C3CDDB',
  };

  let series = [];

  // 小灰色圆盘
  series.push({
    name: '',
    radius: '70%',
    type: 'gauge',
    startAngle: startAngle,
    endAngle: endAngle,
    splitNumber: 2,
    axisLine: {
      show: false,
      lineStyle: {
        width: axisWidth,
        opacity: 0,
      },
    },
    splitLine: { show: false },
    axisTick: {
      show: false,
      length: 5,
      splitNumber: split / 2,
      lineStyle: {
        color: color.smallTickColor,
        width: lineWidth - 1,
      },
    },
    axisLabel: {
      show: true,
      color: color.labelColor,
      fontSize: 10,
      fontFamily: 'PingFangSC-Regular',
      formatter: function (value) {
        return data.min + ((data.max - data.min) * value) / 100;
      },
    },
    pointer: { show: false },
    itemStyle: {},
    title: { show: false },
    detail: { show: false },
  });
  // 彩色圆盘
  series.push({
    name: data.name,
    type: 'gauge',
    radius: '61%',
    startAngle: startAngle,
    endAngle: curAngle,
    splitNumber: 1,
    title: { show: false },
    // 轴线样式
    axisLine: {
      show: true,
      roundCap: true,
      lineStyle: {
        width: 8,
        color: [
          [
            1,
            {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                {
                  offset: 0.1,
                  color: '#FA256B',
                },
                {
                  offset: 1,
                  color: '#8D4DE8',
                },
              ],
              global: false, // 缺省为 false
            },
          ],
        ],
      },
    },
    // 分段样式
    splitLine: { show: false },
    axisLabel: { show: false },
    pointer: { show: false },
    // 指针样式
    itemStyle: {},
    detail: {
      valueAnimation: true,
      color: color.titleColor,
      fontSize: fontSize,
      fontFamily: 'PingFangSC-Medium',
      offsetCenter: [0, '18%'],
      formatter: function (v) {
        return v + `\n{unit|${data.unit ? data.unit : ''}}`;
      },
      rich: {
        unit: {
          fontSize: 10,
          color: color.unitColor,
          lineHeight: 18,
        },
      },
      value: data.value,
    },
    data: [
      {
        value: data.value,
        name: data.name,
      },
    ],
  });

  return {
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%',
    },
    backgroundColor: 'transparent',
    series,
  };
}
