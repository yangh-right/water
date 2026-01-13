const color = ['#5790FB', '#9B92F3', '#25D8AF', '#FFCC34'];
// 获取线形的配置
export function getLine(lineSmooth = false) {
  return {
    symbolSize: 8,
    smooth: lineSmooth
  };
}

// 获取柱状图的配置
export function getBar() {
  return {
    barWidth: 10,
    itemStyle: {
      barBorderRadius: [2, 2, 0, 0]
    }
  };
}

// 获取基本配置
export function getBaseOption(type, doubleyAxis, layout, chartName) {
  const baseOption = {
    color,
    legend: {
      type: 'scroll',
      top: layout ? 0 : void 0,
      bottom: layout ? void 0 : 0,
      padding: [5, 20, 6, 0],
      itemGap: 20,
      itemWidth: 13,
      itemHeight: 8,
      textStyle: {
        color: '#666',
        padding: [2, 0, 0, 0],
        fontSize: 12
      },
      data: []
    },
    grid: {
      containLabel: true,
      top: layout ? 36 : 56,
      left: 22,
      right: 16,
      bottom: layout ? 26 : 58
    },
    xAxis: [
      {
        type: 'category',
        axisLine: {
          show: false
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          color: '#999'
        },
        axisTick: {
          show: false
        },
        data: []
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLine: {
          show: false
        },
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        },
        axisLabel: {
          color: '#999'
        },
        axisTick: {
          show: false
        },
        nameTextStyle: {
          color: '#666',
          align: 'center',
          padding: [0, 0, 0, 38]
        }
      }
    ],
    dataZoom: [
      {
        show: true,
        type: 'slider',
        realtime: true,
        height: 19,
        bottom: layout ? 5 : 30,
        // backgroundColor: '#F1F6FD',
        // borderColor: 'rgba(255, 255, 255, 1)',
        // fillerColor: 'rgba(163,186,219,.12)',
        moveHandleSize: 0,
        handleIcon:
          'path://M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: 20,
        handleStyle: {
          // color: '#F9F9F9',
          shadowBlur: 6,
          shadowOffsetX: 1,
          shadowOffsetY: 2,
          shadowColor: '#E5ECF2'
        },
        dataBackground: {
          lineStyle: {
            width: 0
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
                  offset: 0,
                  color: 'rgba(223,232,245,0.46)' // 0% 处的颜色
                },
                {
                  offset: 1,
                  color: '#dfe8f5' // 100% 处的颜色
                }
              ],
              global: false // 缺省为 false
            }
          }
        },
        labelFormatter: ''
      }
    ],
    tooltip: {
      trigger: 'axis',
      className: 'wbgc-card',
      borderWidth: 0,
      textStyle: {
        fontSize: 10
      },
      formatter: (params) => {
        let html = '';
        params.forEach((item, i) => {
          html += `<p style="margin-bottom: ${i !== params.length - 1 ? 6 : 0}px;">
        <span style="display: inline-block;
        width: 6px;
        height: 6px;
        margin-right: 4px;
        vertical-align: middle;
        background-color: ${item.color};
        border-radius: 6px;"></span>
        <span class="wfc2" style="display: inline-block;
        font-size: 12px;
        vertical-align: middle;">${item.seriesName}: ${item.data}</span>
        </p>`;
        });
        return `<p class="wfc2" style="margin-bottom: 4px;font-size: 12px;">
        ${params[0].axisValue}</p>${html}`;
      },
      padding: [8, 10],
      extraCssText: 'box-shadow: 0px 2px 10px 0px rgba(0,0,0,0.1);'
    },
    toolbox: {
      show: true,
      showTitle: false,
      top: -2,
      right: 20,
      itemSize: 12,
      feature: {
        dataView: {
          readOnly: true,
          icon: 'M11.4583333,2.5 L5.625,2.5 C4.82291667,2.5 4.17395833,3.15625 4.17395833,3.95833333 L4.16666667,15.625 C4.16666667,16.4270833 4.815625,17.0833333 5.61770833,17.0833333 L14.375,17.0833333 C15.1770833,17.0833333 15.8333333,16.4270833 15.8333333,15.625 L15.8333333,6.875 L11.4583333,2.5 L11.4583333,2.5 Z M12.9166667,14.1666667 L7.08333333,14.1666667 L7.08333333,12.7083333 L12.9166667,12.7083333 L12.9166667,14.1666667 L12.9166667,14.1666667 Z M12.9166667,11.25 L7.08333333,11.25 L7.08333333,9.79166667 L12.9166667,9.79166667 L12.9166667,11.25 L12.9166667,11.25 Z M10.7291667,7.60416667 L10.7291667,3.59375 L14.7395833,7.60416667 L10.7291667,7.60416667 L10.7291667,7.60416667 Z',
          iconStyle: {
            color: '#a2b0c6',
            borderWidth: 0
          },
          buttonColor: '#4285f4',
          optionToContent: function (opt) {
            let axisData = opt.xAxis[0].data;
            let series = opt.series;
            let dom = '<div style="width: 20%;"><p style="line-height: 26px;">时间</p>';
            axisData.forEach((val) => {
              dom += `<p style="line-height: 26px;">${val}</p>`;
            });
            dom += '</div>';
            series.forEach((v) => {
              let _series = `<div style="width: 20%;"><p style="line-height: 26px;">${v.name}</p>`;
              v.data.forEach((val) => {
                _series += `<p style="line-height: 26px;">${val}</p>`;
              });
              _series += '</div>';
              dom += _series;
            });
            return `<div style="display: flex;">${dom}</div>`;
          }
        },
        saveAsImage: {
          name: chartName,
          icon: 'M24 14.19h-4.571v-6.857h-6.857v6.857h-4.571l8 8 8-8zM8 23.143v2.286h16v-2.286h-16z',
          iconStyle: {
            color: '#a2b0c6',
            borderWidth: 0
          }
        }
      },
      tooltip: {
        show: true,
        formatter: function (param) {
          return '<div>' + param.title + '</div>';
        }
      }
    },
    series: []
  };
  if (type === 'bar') {
    baseOption.tooltip.axisPointer = {
      type: 'shadow',
      shadowStyle: {
        color: '#FFEDF4',
        opacity: 0.3
      }
    };
  }
  // 双y轴的情况
  if (doubleyAxis) {
    baseOption.yAxis.push({
      type: 'value',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#999'
      },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      },
      nameTextStyle: {
        color: '#666'
      }
    });
  }
  return baseOption;
}

// 生成饼图配置
export function genCirclePieOptions(layout, unit, chartName) {
  const themeColor = {
    labelColor: '#999'
  };
  const _colors = ['#FFCC34', '#5790FB', '#8EB5FF', '#25D8AF', '#817DFF'];
  let _options = {
    color: _colors,
    title: {
      top: layout ? '43%' : '50%',
      left: layout ? '50%' : '28%',
      textAlign: 'center',
      textVerticalAlign: 'middle',
      itemGap: 26,
      padding: 0,
      textStyle: {
        fontSize: 16,
        // color: '#333',
        fontWeight: 'normal'
      },
      subtextStyle: {
        fontSize: 20
        // color: '#333'
      },
      triggerEvent: true
    },
    tooltip: {
      confine: true,
      className: 'wbgc-card',
      borderWidth: 0,
      axisPointer: {
        type: 'cross',
        label: {
          color: '#666',
          backgroundColor: '#fff'
        }
      },
      textStyle: {
        fontSize: 10,
        color: '#666'
      },
      formatter: (params) => {
        return `<p>
          <span class="wfc2" style="display: inline-block;
          font-size: 10px;
          vertical-align: middle;">${params.data.name} ${params.value}次<br/>占比${params.percent}%</span>
          </p>`;
      },
      padding: [8, 10],
      extraCssText: 'box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.10);'
    },
    legend: {
      type: 'scroll',
      orient: layout ? 'horizontal' : 'vertical',
      top: layout ? void 0 : 'middle',
      left: layout ? 'center' : '65%',
      bottom: layout ? 0 : void 0,
      icon: 'rect',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 10,
      pageIconSize: 10,
      pageTextStyle: {
        fontSize: 12
      },
      textStyle: {
        padding: [2, 0, 0, 0],
        fontSize: 14,
        lineHeight: 16,
        color: themeColor.labelColor
      },
      data: []
    },
    toolbox: {
      show: true,
      showTitle: false,
      top: 3,
      right: 0,
      itemSize: 12,
      feature: {
        dataView: {
          icon: 'M11.4583333,2.5 L5.625,2.5 C4.82291667,2.5 4.17395833,3.15625 4.17395833,3.95833333 L4.16666667,15.625 C4.16666667,16.4270833 4.815625,17.0833333 5.61770833,17.0833333 L14.375,17.0833333 C15.1770833,17.0833333 15.8333333,16.4270833 15.8333333,15.625 L15.8333333,6.875 L11.4583333,2.5 L11.4583333,2.5 Z M12.9166667,14.1666667 L7.08333333,14.1666667 L7.08333333,12.7083333 L12.9166667,12.7083333 L12.9166667,14.1666667 L12.9166667,14.1666667 Z M12.9166667,11.25 L7.08333333,11.25 L7.08333333,9.79166667 L12.9166667,9.79166667 L12.9166667,11.25 L12.9166667,11.25 Z M10.7291667,7.60416667 L10.7291667,3.59375 L14.7395833,7.60416667 L10.7291667,7.60416667 L10.7291667,7.60416667 Z',
          iconStyle: {
            color: '#a2b0c6',
            borderWidth: 0
          },
          readOnly: true,
          buttonColor: '#4285f4',
          optionToContent: function (opt) {
            let series = opt.series[0].data;
            let dom = '';
            series.forEach((v) => {
              let _series = `<div style="display: flex;"><p style="width: 40%; line-height: 26px;">${v.name}</p><p style="line-height: 26px;">${v.value}</p></div>`;
              dom += _series;
            });
            return `<div>${dom}</div>`;
          }
        },
        saveAsImage: {
          name: chartName,
          icon: 'M24 14.19h-4.571v-6.857h-6.857v6.857h-4.571l8 8 8-8zM8 23.143v2.286h16v-2.286h-16z',
          iconStyle: {
            color: '#a2b0c6',
            borderWidth: 0
          }
        }
      },
      tooltip: {
        show: true,
        formatter: function (param) {
          return '<div>' + param.title + '</div>';
        }
      }
    },
    series: [
      {
        type: 'pie',
        center: layout ? ['50%', '42%'] : ['28%', '50%'],
        radius: ['46%', '66%'],
        label: {
          show: false,
          position: 'center'
        },
        labelLine: {
          show: false
        },
        data: []
      }
    ]
  };
  return _options;
}
