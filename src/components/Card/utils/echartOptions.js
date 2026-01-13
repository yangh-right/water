const echarts = require('echarts');

const _colors = [
  {
    baseColor: '#488BFF',
    startColor: 'rgba(66,133,244,0.30)',
    startOffset: 0.15,
    endColor: 'rgba(66,133,244,0.08)'
  },
  {
    baseColor: '#26CEBA',
    startColor: 'rgba(135,206,64,0.30)',
    startOffset: 0.15,
    endColor: 'rgba(135,206,64,0.00)'
  },
  {
    baseColor: '#FFC069',
    startColor: 'rgba(252,160,0,0.30)',
    startOffset: 0.15,
    endColor: 'rgba(252,160,0,0.08)'
  },
  {
    baseColor: '#FD6865',
    startColor: 'rgba(149,103,255,0.30)',
    startOffset: 0.15,
    endColor: 'rgba(149,103,255,0.08)'
  },
  {
    baseColor: '#6D7EE4',
    startColor: 'rgba(255,73,140,0.30)',
    startOffset: 0.15,
    endColor: 'rgba(255,73,140,0.08)'
  },
  {
    baseColor: '#FF9C6E',
    startColor: 'rgba(215,121,255,0.30)',
    startOffset: 0.15,
    endColor: 'rgba(215,121,255,0.08)'
  },
  {
    baseColor: '#81C785',
    startColor: 'rgba(72,193,230,0.30)',
    startOffset: 0.15,
    endColor: 'rgba(72,193,230,0.08)'
  },
  {
    baseColor: '#B47FEC',
    startColor: 'rgba(255,199,4,0.30)',
    startOffset: 0.15,
    endColor: 'rgba(255,199,4,0.08)'
  },
  {
    baseColor: '#62A5F6',
    startColor: 'rgba(64,201,169,0.30)',
    startOffset: 0.15,
    endColor: 'rgba(64,201,169,0.08)'
  },
  {
    baseColor: '#FF85C0',
    startColor: 'rgba(205,206,96,0.30)',
    startOffset: 0.15,
    endColor: 'rgba(205,206,96,0.08)'
  }
];

// 图表是否缩放（相关属性值变大）
let zoom = false;

function genAxisOption(type) {
  const themeColor = {
    labelColor: '#999',
    axisColor: '#e0e7ff',
    splitLineColor: 'rgba(222,226,231,.5)',
    line1Color: '#87CE40',
    line2Color: '#4285F4'
  };
  let _options = {
    grid: {
      containLabel: true,
      top: 10,
      left: zoom ? 15 : 20,
      right: zoom ? 40 : 35,
      bottom: zoom ? 50 : 40
    },
    title: {
      show: false,
      left: 20,
      text: '营业曲线',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#6281A3'
      }
    },
    tooltip: {
      confine: true,
      trigger: 'axis',
      backgroundColor: '#fff',
      axisPointer: {
        type: 'cross',
        label: {
          color: '#666',
          backgroundColor: '#fff'
        },
        lineStyle: {
          color: themeColor.splitLineColor
        },
        crossStyle: {
          color: themeColor.splitLineColor
        }
      },
      textStyle: {
        fontSize: zoom ? 14 : 10,
        color: '#666'
      },
      padding: 10,
      extraCssText: 'box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.10);'
    },
    legend: {
      type: 'scroll',
      bottom: zoom ? 13 : 8,
      padding: [5, 20, 5, 0],
      icon: 'rect',
      itemWidth: 20,
      itemHeight: 2,
      itemGap: 20,
      pageIconSize: zoom ? 16 : 10,
      pageTextStyle: {
        fontSize: zoom ? 14 : 12
      },
      textStyle: {
        padding: [2, 0, 0, 0],
        fontSize: zoom ? 14 : 12,
        color: themeColor.labelColor
      }
    },
    xAxis: [
      {
        type: 'category',
        axisLabel: {
          fontSize: zoom ? 14 : 12,
          color: themeColor.labelColor,
          formatter: null
        },
        axisLine: {
          lineStyle: {
            color: themeColor.axisColor
          }
        },
        splitLine: {
          show: false
        },
        axisTick: {
          show: false
        }
      }
    ],
    yAxis: [
      {
        nameTextStyle: {
          align: 'center',
          color: themeColor.labelColor
        },
        type: 'value',
        position: 'left',
        axisLabel: {
          fontSize: zoom ? 14 : 12,
          color: themeColor.labelColor,
          formatter: null
        },
        axisLine: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: themeColor.splitLineColor
          }
        },
        axisTick: {
          show: false
        }
      }
    ]
  };
  if (type === 'bar') {
    _options.legend.itemWidth = zoom ? 10 : 8;
    _options.legend.itemHeight = zoom ? 10 : 8;
    _options.tooltip.axisPointer = {
      type: 'shadow',
      shadowStyle: {
        color: '#4285F4',
        opacity: 0.1
      }
    };
  }
  return _options;
}

// 折线图
function genLine(i) {
  return {
    yAxisIndex: 0,
    type: 'line',
    symbol: 'emptyCircle',
    showSymbol: true,
    itemStyle: {
      color: _colors[i % _colors.length].baseColor
    },
    lineStyle: {
      width: zoom ? 1.5 : 1
    }
  };
}

// 面积折线图
function genAreaLine(i) {
  const _idx = i % _colors.length;
  return {
    yAxisIndex: 0,
    type: 'line',
    symbol: 'circle',
    showSymbol: false,
    itemStyle: {
      color: _colors[_idx].baseColor
    },
    lineStyle: {
      width: zoom ? 1.5 : 1
    },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          {
            offset: _colors[_idx].startOffset || 0,
            color: _colors[_idx].startColor
          },
          {
            offset: _colors[_idx].endOffset || 1,
            color: _colors[_idx].endColor
          }
        ],
        global: false // 缺省为 false
      }
    }
  };
}

// 平滑的面积折线图
function genSmoothAreaLine(i) {
  const _idx = i % _colors.length;
  return {
    yAxisIndex: 0,
    type: 'line',
    symbol: 'circle',
    showSymbol: false,
    smooth: true,
    itemStyle: {
      color: _colors[_idx].baseColor
    },
    lineStyle: {
      opacity: 0
    },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          {
            offset: _colors[_idx].startOffset || 0,
            color: _colors[_idx].startColor
          },
          {
            offset: _colors[_idx].endOffset || 1,
            color: _colors[_idx].endColor
          }
        ],
        global: false // 缺省为 false
      }
    }
  };
}

// 柱状图
function genBar(i) {
  const _idx = i % _colors.length;
  return {
    yAxisIndex: 0,
    type: 'bar',
    barMaxWidth: zoom ? 10 : 4,
    barGap: '100%',
    itemStyle: {
      color: _colors[_idx].baseColor,
      barBorderRadius: [5, 5, 0, 0]
    }
  };
}

// 堆叠柱状图
function genStackBar(i) {
  const _idx = i % _colors.length;
  return {
    yAxisIndex: 0,
    type: 'bar',
    stack: 'default',
    barWidth: zoom ? 10 : 5,
    itemStyle: {
      color: _colors[_idx].baseColor
    }
  };
}

// 生成简单图表的组合配置
function genComposeOptions(typeArr) {
  // 仅支持折线图和柱状图组合，且坐标轴一致
  let _axisOptions = genAxisOption(typeArr[0].type);

  // eslint-disable-next-line array-callback-return
  _axisOptions.series = typeArr.map(({ type, cType }, i) => {
    switch (cType) {
      case 'line':
        return genLine(i);
      case 'areaLine':
        return genAreaLine(i);
      case 'smoothAreaLine':
        return genSmoothAreaLine(i);
      case 'bar':
        return genBar(i);
      case 'stackBar':
        return genStackBar(i);
      default:
        console.log(`暂不支持${type}类型的${cType}图表组合！`);
    }
  });
  return _axisOptions;
}

// 生成反转柱状图
function genReverseBarOptions() {
  let _baseOptions = genAxisOption('bar');
  // 坐标轴反转
  let _tmpAxis = _baseOptions.xAxis;
  _baseOptions.xAxis = _baseOptions.yAxis;
  _baseOptions.yAxis = _tmpAxis;
  _baseOptions.yAxis[0].inverse = true;
  _baseOptions.yAxis[0].axisLabel.formatter = function(value) {
    return value.length >= 5 ? value.substring(0, 4).concat('...') : value;
  };
  // 创建series
  _baseOptions.series = [
    {
      yAxisIndex: 0,
      type: 'bar',
      barWidth: zoom ? 16 : 7,
      itemStyle: {
        color: '#4285F4',
        barBorderRadius: [0, 10, 10, 0]
      },
      showBackground: true,
      backgroundStyle: {
        color: '#F5F5F5'
      }
    }
  ];
  return _baseOptions;
}

// 生成反转堆叠柱状图
function genReverseStackBarOptions(seriesLen) {
  let _baseOptions = genAxisOption('bar');
  // 坐标轴反转
  let _tmpAxis = _baseOptions.xAxis;
  _baseOptions.xAxis = _baseOptions.yAxis;
  _baseOptions.yAxis = _tmpAxis;
  // 创建series
  _baseOptions.series = Array.from({ length: seriesLen }, (_, i) => genStackBar(i));
  return _baseOptions;
}

// 生成饼图配置
function genCirclePieOptions(data) {
  const themeColor = {
    labelColor: '#999'
  };
  let _options = {
    title: {
      top: '45%',
      left: '25%',
      text: '',
      subtext: '',
      textAlign: 'center',
      textVerticalAlign: 'middle',
      itemGap: zoom ? 16 : 12,
      padding: 0,
      textStyle: {
        fontSize: zoom ? 16 : 14,
        fontWeight: 'normal',
        color: '#999'
      },
      subtextStyle: {
        fontSize: zoom ? 30 : 20,
        color: '#333'
      }
    },
    tooltip: {
      confine: true,
      backgroundColor: '#fff',
      axisPointer: {
        type: 'cross',
        label: {
          color: '#666',
          backgroundColor: '#fff'
        }
      },
      textStyle: {
        fontSize: zoom ? 14 : 10,
        color: '#666'
      },
      padding: 10,
      extraCssText: 'box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.10);'
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      top: 'middle',
      left: '60%',
      icon: 'rect',
      itemWidth: zoom ? 10 : 8,
      itemHeight: zoom ? 10 : 8,
      itemGap: zoom ? 20 : 15,
      pageIconSize: zoom ? 16 : 10,
      pageTextStyle: {
        fontSize: zoom ? 14 : 12
      },
      textStyle: {
        padding: [2, 0, 0, 0],
        fontSize: zoom ? 16 : 12,
        lineHeight: 16,
        color: themeColor.labelColor
      },
      formatter: function(name) {
        return echarts.format.truncateText(name, 175, '', '…');
      },
      tooltip: {
        show: true
      }
    },
    series: [
      {
        type: 'pie',
        center: ['25%', '50%'],
        radius: ['56%', '76%'],
        label: {
          show: false,
          position: 'center'
        },
        labelLine: {
          show: false
        },
        data: data.map((v, i) => {
          return {
            ...v,
            itemStyle: {
              color: _colors[i % _colors.length].baseColor
            }
          };
        })
      }
    ]
  };
  return _options;
}

// 生成雷达图配置
function genRadarOptions(seriesLen) {
  const themeColor = {
    labelColor: '#999'
  };
  let _options = {
    tooltip: {
      confine: true,
      backgroundColor: '#fff',
      axisPointer: {
        type: 'cross',
        label: {
          color: '#666',
          backgroundColor: '#fff'
        }
      },
      textStyle: {
        fontSize: zoom ? 14 : 10,
        color: '#666'
      },
      padding: 10,
      extraCssText: 'box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.10);'
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      top: 'middle',
      left: '70%',
      icon: 'rect',
      itemWidth: 20,
      itemHeight: 2,
      itemGap: zoom ? 20 : 15,
      pageIconSize: zoom ? 16 : 10,
      pageTextStyle: {
        fontSize: zoom ? 14 : 12
      },
      textStyle: {
        padding: [2, 0, 0, 0],
        fontSize: zoom ? 14 : 12,
        lineHeight: 16,
        color: themeColor.labelColor
      },
      formatter(params) {
        return params
          .split(/(.{7})/)
          .filter(v => v)
          .join('\n');
      }
    },
    radar: [
      {
        shape: 'polygon',
        splitNumber: 3,
        center: ['35%', '50%'],
        radius: '71%',
        name: {
          textStyle: {
            fontSize: zoom ? 14 : 12,
            color: '#999'
          }
        },
        nameGap: 12,
        indicator: [{}],
        splitLine: {
          show: true,
          lineStyle: {
            width: 1,
            color: '#DEE2E7'
          }
        },
        splitArea: {
          show: false
        },
        axisLine: {
          lineStyle: {
            color: '#DEE2E7'
          }
        }
      }
    ],
    series: [
      {
        name: '雷达图',
        type: 'radar',
        symbol: 'circle',
        symbolSize: 6,
        data: Array.from({ length: seriesLen }, (_, i) => ({
          itemStyle: {
            normal: {
              color: _colors[i % _colors.length].baseColor,
              lineStyle: {
                color: _colors[i % _colors.length].baseColor
              }
            }
          }
        }))
      }
    ]
  };
  return _options;
}

// 旭日图
function genSunburst() {
  let _options = {
    color: _colors.map(v=> { return v.baseColor; }),
    tooltip: {
      confine: true,
      backgroundColor: '#fff',
      axisPointer: {
        type: 'cross',
        label: {
          color: '#666',
          backgroundColor: '#fff'
        }
      },
      textStyle: {
        fontSize: zoom ? 14 : 10,
        color: '#666'
      },
      padding: 10,
      extraCssText: 'box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.10);'
    },
    series: []
  };
  return _options;
}

// 散点图
function genScatter() {
  const themeColor = {
    labelColor: '#999',
    axisColor: '#e0e7ff',
    splitLineColor: 'rgba(222,226,231,.5)',
    line1Color: '#87CE40',
    line2Color: '#4285F4'
  };
  let _options = {
    color: _colors.map(v=> { return v.baseColor; }),
    grid: {
      containLabel: true,
      top: 10,
      left: zoom ? 15 : 20,
      right: zoom ? 40 : 35,
      bottom: zoom ? 50 : 40
    },
    title: {
      show: false,
      left: 20,
      text: '营业曲线',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
        color: '#6281A3'
      }
    },
    tooltip: {
      confine: true,
      trigger: 'item',
      backgroundColor: '#fff',
      axisPointer: {
        type: 'shadow',
        label: {
          color: '#666',
          backgroundColor: '#fff'
        },
        lineStyle: {
          color: themeColor.splitLineColor
        },
        crossStyle: {
          color: themeColor.splitLineColor
        },
        shadowStyle: {
          color: '#4285F4',
          opacity: 0.1
        }
      },
      textStyle: {
        fontSize: zoom ? 14 : 10,
        color: '#666'
      },
      padding: 10,
      extraCssText: 'box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.10);'
    },
    legend: {
      type: 'scroll',
      bottom: zoom ? 13 : 8,
      padding: [5, 20, 5, 0],
      icon: 'rect',
      itemWidth: zoom ? 10 : 8,
      itemHeight: zoom ? 10 : 8,
      itemGap: 20,
      pageIconSize: zoom ? 16 : 10,
      pageTextStyle: {
        fontSize: zoom ? 14 : 12
      },
      textStyle: {
        padding: [2, 0, 0, 0],
        fontSize: zoom ? 14 : 12,
        color: themeColor.labelColor
      }
    },
    xAxis: [
      {
        type: 'value',
        axisLabel: {
          fontSize: zoom ? 14 : 12,
          color: themeColor.labelColor,
          formatter: null
        },
        axisLine: {
          lineStyle: {
            color: themeColor.axisColor
          }
        },
        splitLine: {
          show: false
        },
        axisTick: {
          show: false
        }
      }
    ],
    yAxis: [
      {
        nameTextStyle: {
          align: 'center',
          color: themeColor.labelColor
        },
        type: 'value',
        position: 'left',
        axisLabel: {
          fontSize: zoom ? 14 : 12,
          color: themeColor.labelColor,
          formatter: null
        },
        axisLine: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: themeColor.splitLineColor
          }
        },
        axisTick: {
          show: false
        }
      }
    ],
    series: []
  };
  return _options;
}

export default function(_zoom) {
  zoom = !!_zoom;
  return {
    compose: genComposeOptions,
    reverseBar: genReverseBarOptions,
    reverseStackBar: genReverseStackBarOptions,
    circlePie: genCirclePieOptions,
    radar: genRadarOptions,
    sunburst: genSunburst,
    scatter: genScatter
  };
}
