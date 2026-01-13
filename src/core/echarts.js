import * as echarts from "echarts";
const darkCustomed = 
{
    "color": [
        "#4285f4",
        "#2eddf9",
        "#8479ea",
        "#87ce40",
        "#49cddc",
        "#5aaef3"
    ],
    "backgroundColor": "rgba(50,50,50,0)",
    "textStyle": {},
    "title": {
        "textStyle": {
            "color": "#ffffff"
        },
        "subtextStyle": {
            "color": "#adb5bd"
        }
    },
    "line": {
        "itemStyle": {
            "borderWidth": "0"
        },
        "lineStyle": {
            "width": "2"
        },
        "symbolSize": "0",
        "symbol": "emptyCircle",
        "smooth": false
    },
    "radar": {
        "itemStyle": {
            "borderWidth": "0"
        },
        "lineStyle": {
            "width": "2"
        },
        "splitLine": { // 雷达图分割线颜色适配
            "lineStyle": {
              "color": '#282E34'
            },
            "width": 1
          },
        "symbolSize": "0",
        "symbol": "emptyCircle",
        "smooth": false
    },
    "bar": {
        "itemStyle": {
            "barBorderWidth": "0",
            "barBorderColor": "#cccccc"
        }
    },
    "pie": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#cccccc"
        }
    },
    "scatter": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#cccccc"
        }
    },
    "boxplot": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#cccccc"
        }
    },
    "parallel": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#cccccc"
        }
    },
    "sankey": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#cccccc"
        }
    },
    "funnel": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#cccccc"
        }
    },
    "gauge": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#cccccc"
        }
    },
    "candlestick": {
        "itemStyle": {
            "color": "#eb5454",
            "color0": "#47b262",
            "borderColor": "#eb5454",
            "borderColor0": "#47b262",
            "borderWidth": 1
        }
    },
    "graph": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#cccccc"
        },
        "lineStyle": {
            "width": 1,
            "color": "#aaa"
        },
        "symbolSize": "0",
        "symbol": "emptyCircle",
        "smooth": false,
        "color": [
            "#4285f4",
            "#2eddf9",
            "#8479ea",
            "#87ce40",
            "#49cddc",
            "#5aaef3"
        ],
        "label": {
            "color": "#ffffff"
        }
    },
    "map": {
        "itemStyle": {
            "areaColor": "#eee",
            "borderColor": "#444",
            "borderWidth": 0.5
        },
        "label": {
            "color": "#000"
        },
        "emphasis": {
            "itemStyle": {
                "areaColor": "rgba(255,215,0,0.8)",
                "borderColor": "#444",
                "borderWidth": 1
            },
            "label": {
                "color": "rgb(100,0,0)"
            }
        }
    },
    "geo": {
        "itemStyle": {
            "areaColor": "#eee",
            "borderColor": "#444",
            "borderWidth": 0.5
        },
        "label": {
            "color": "#000"
        },
        "emphasis": {
            "itemStyle": {
                "areaColor": "rgba(255,215,0,0.8)",
                "borderColor": "#444",
                "borderWidth": 1
            },
            "label": {
                "color": "rgb(100,0,0)"
            }
        }
    },
    "categoryAxis": {
        "axisLine": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisTick": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisLabel": {
            "show": true,
            "color": "#adb5bd"
        },
        "splitLine": {
            "show": false,
            "lineStyle": {
                "color": [
                    "#E0E6F1"
                ]
            }
        },
        "splitArea": {
            "show": false,
            "areaStyle": {
                "color": [
                    "rgba(250,250,250,0.2)",
                    "rgba(210,219,238,0.2)"
                ]
            }
        }
    },
    "valueAxis": {
        "axisLine": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisTick": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisLabel": {
            "show": true,
            "color": "#adb5bd"
        },
        "splitLine": {
            "show": true,
            "lineStyle": {
                "color": [
                    "#282e34"
                ]
            }
        },
        "splitArea": {
            "show": false,
            "areaStyle": {
                "color": [
                    "rgba(250,250,250,0.2)",
                    "rgba(210,219,238,0.2)"
                ]
            }
        }
    },
    "logAxis": {
        "axisLine": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisTick": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisLabel": {
            "show": true,
            "color": "#adb5bd"
        },
        "splitLine": {
            "show": true,
            "lineStyle": {
                "color": [
                    "#282e34"
                ]
            }
        },
        "splitArea": {
            "show": false,
            "areaStyle": {
                "color": [
                    "rgba(250,250,250,0.2)",
                    "rgba(210,219,238,0.2)"
                ]
            }
        }
    },
    "timeAxis": {
        "axisLine": {
            "show": true,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisTick": {
            "show": true,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisLabel": {
            "show": true,
            "color": "#6E7079"
        },
        "splitLine": {
            "show": false,
            "lineStyle": {
                "color": [
                    "#E0E6F1"
                ]
            }
        },
        "splitArea": {
            "show": false,
            "areaStyle": {
                "color": [
                    "rgba(250,250,250,0.2)",
                    "rgba(210,219,238,0.2)"
                ]
            }
        }
    },
    "toolbox": {
        "iconStyle": {
            "borderColor": "#999"
        },
        "emphasis": {
            "iconStyle": {
                "borderColor": "#666"
            }
        }
    },
    "legend": {
        "textStyle": {
            "color": "#adb5bd"
        }
    },
    "tooltip": {
        "axisPointer": {
            "lineStyle": {
                "color": "#ccc",
                "width": 1
            },
            "crossStyle": {
                "color": "#ccc",
                "width": 1
            }
            
        },
        "backgroundColor": '#1E222E',
        "textStyle": {
            "color": '#ADB5BD'
        }
    },
    "timeline": {
        "lineStyle": {
            "color": "#DAE1F5",
            "width": 2
        },
        "itemStyle": {
            "color": "#A4B1D7",
            "borderWidth": 1
        },
        "controlStyle": {
            "color": "#A4B1D7",
            "borderColor": "#A4B1D7",
            "borderWidth": 1
        },
        "checkpointStyle": {
            "color": "#316bf3",
            "borderColor": "fff"
        },
        "label": {
            "color": "#A4B1D7"
        },
        "emphasis": {
            "itemStyle": {
                "color": "#FFF"
            },
            "controlStyle": {
                "color": "#A4B1D7",
                "borderColor": "#A4B1D7",
                "borderWidth": 1
            },
            "label": {
                "color": "#A4B1D7"
            }
        }
    },
    "visualMap": {
        "color": [
            "#bf444c",
            "#d88273",
            "#f6efa6"
        ]
    },
    "dataZoom": {
        "handleSize": "undefined%",
        "textStyle": {}
    },
    "markPoint": {
        "label": {
            "color": "#ffffff"
        },
        "emphasis": {
            "label": {
                "color": "#ffffff"
            }
        }
    }
}


const darkCustomed_copy = {
  // color: [
  //   '#71a3f8', '#3366ff', '#3498fd', '#21d3f0',
  //   '#87ce40', '#adce00', '#1098ad', '#8479ea',
  //   '#1f40c0', '#29dcb1', '#00baab', '#eae138',
  //   '#f59f00', '#e8590c', '#e82b40', '#cc2b6c',
  //   '#4e40d5', '#5b7300', '#007558', '#4e9420'
  // ],
  color: ['#8479EA', '#21D3F0', '#4285F4'],
  //   "backgroundColor": "rgba(18,22,29,1)",
  textStyle: {},
  title: {
    textStyle: {
      color: "#ffffff",
    },
  //   subtextStyle: {
  //     color: "#aaaaaa",
  //   },
  //   backgroundColor: "#181c24",
  // },
  // line: {
  //   itemStyle: {
  //     borderWidth: "0",
  //   },
  //   lineStyle: {
  //     width: "1.5",
  //   },
  //   symbolSize: "2",
  //   symbol: "circle",
  //   smooth: true,
  },
  radar: {
    itemStyle: {
      borderWidth: "0",
    },
    splitLine: {
      lineStyle: {
        color: '#282E34'
      },
      width: 1
    },
    lineStyle: {
      width: "1.5",
    },
    symbolSize: "2",
    symbol: "circle",
    smooth: true,
  },
  bar: {
    itemStyle: {
      barBorderWidth: "0",
      barBorderColor: "#ccc",

    },
    emphasis: {
      itemStyle: {
        barBorderWidth: "0",
        barBorderColor: "#ccc",
      }
    },
  },
  pie: {
    itemStyle: {
      borderWidth: "0",
      borderColor: "#ccc",
      emphasis: {
        borderWidth: "0",
        borderColor: "#ccc",
      }
    },
    emphasis: {
      itemStyle: {
        borderWidth: "0",
        borderColor: "#ccc",
      }
    }
  },
  scatter: {
    itemStyle: {
      borderWidth: "0",
      borderColor: "#ccc",

    },
    emphasis: {
      itemStyle: {
        borderWidth: "0",
        borderColor: "#ccc",
      },
    }
  },
  boxplot: {
    itemStyle: {
      borderWidth: "0",
      borderColor: "#ccc",
    },
    emphasis: {
      itemStyle: {
        borderWidth: "0",
        borderColor: "#ccc",
      }
    },
  },
  parallel: {
    itemStyle: {
      borderWidth: "0",
      borderColor: "#ccc",
    },

    emphasis: {
      itemStyle: {
        borderWidth: "0",
        borderColor: "#ccc",
      }
    },
  },
  sankey: {
    itemStyle: {
      borderWidth: "0",
      borderColor: "#ccc",
    },
    emphasis: {
      itemStyle: {
        borderWidth: "0",
        borderColor: "#ccc",
      }
    },
  },
  funnel: {
    itemStyle: {
      borderWidth: "0",
      borderColor: "#ccc",
    },
    emphasis: {
      itemStyle: {
        borderWidth: "0",
        borderColor: "#ccc",
      }
    },
  },
  gauge: {
    itemStyle: {
      borderWidth: "0",
      borderColor: "#ccc",
    },
    emphasis: {
      itemStyle: {
        borderWidth: "0",
        borderColor: "#ccc",
      }
    },
  },
  candlestick: {
    itemStyle: {
      color: "#f64357",
      color0: "#47efe1",
      borderColor: "#f64357",
      borderColor0: "#47efe1",
      borderWidth: "-22",
    },
  },
  graph: {
    itemStyle: {
      borderWidth: "0",
      borderColor: "#ccc",
    },
    lineStyle: {
      width: "1",
      color: "#495057",
    },
    symbolSize: "2",
    symbol: "circle",
    smooth: true,
    color: ["#4285f4", "#47efe1", "#f64357", "#ffd43b", "#8479ea", "#f687b4"],
    label: {
      textStyle: {
        color: "#ffffff",
      },
    },
  },
  map: {
    itemStyle: {
      areaColor: "#343d48",
      borderColor: "#20262f",
      borderWidth: "0.5",
    },

    label: {
      textStyle: {
        color: "#000000",
      },
    },

    emphasis: {
      itemStyle: {
        areaColor: "rgba(66,133,244,1)",
        borderColor: "#444444",
        borderWidth: 1,
      },

      label: {
        textStyle: {
          color: "rgb(255,255,255)",
        },
      }
    },
  },
  geo: {
    itemStyle: {
      areaColor: "#343d48",
      borderColor: "#20262f",
      borderWidth: "0.5",
    },
    label: {
      textStyle: {
        color: "#000000",
      },
      emphasis: {
        textStyle: {
          color: "rgb(255,255,255)",
        },
      },
    },
    emphasis: {
      itemStyle: {
        areaColor: "rgba(66,133,244,1)",
        borderColor: "#444444",
        borderWidth: 1,
      },
      label: {
        textStyle: {
          color: "rgb(255,255,255)",
        },
      },
    },
  },
  categoryAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: "#282e34",
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: "#282e34",
      },
    },
    axisLabel: {
      show: true,
      textStyle: {
        color: "#868e96",
      },
    },
    nameTextStyle: {
      color: '#999'
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ["#282e34"],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ["#eeeeee"],
      },
    },
  },
  valueAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: "#999",
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: "#999",
      },
    },
    axisLabel: {
      show: true,
      textStyle: {
        color: "#999",
      },
    },
    nameTextStyle: {
      color: '#999'
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ["#282E34"],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ["#eeeeee"],
      },
    },
  },
  logAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: "#282e34",
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: "#282e34",
      },
    },
    axisLabel: {
      show: true,
      textStyle: {
        color: "#868e96",
      },
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ["#282e34"],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ["#eeeeee"],
      },
    },
  },
  timeAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: "#282e34",
      },
    },
    axisTick: {
      show: true,
      lineStyle: {
        color: "#282e34",
      },
    },
    axisLabel: {
      show: true,
      textStyle: {
        color: "#868e96",
      },
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: ["#282e34"],
      },
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ["#eeeeee"],
      },
    },
  },
  toolbox: {
    iconStyle: {
      borderColor: "#87909f",
    },
    emphasis: {
      iconStyle: {
        borderColor: "#a2b0c6",
      }
    },
  },
  legend: {
    textStyle: {
      color: "#999",
    },
  },
  tooltip: {
    axisPointer: {
      lineStyle: {
        color: "#4285f4",
        width: "60",
      },
      crossStyle: {
        color: "#4285f4",
        width: "60",
      },
    },
    backgroundColor: '#1E222E',
    textStyle: {
      color: '#ADB5BD'
    }
  },
  timeline: {
    lineStyle: {
      color: "#eeeeee",
      width: 1,
    },
    itemStyle: {
      color: "#dd6b66",
      borderWidth: 1,
    },
    controlStyle: {
      color: "#eeeeee",
      borderColor: "#eeeeee",
      borderWidth: 0.5,
    },
    checkpointStyle: {
      color: "#adb5bd",
      borderColor: "rgba(194,53,49,0.5)",
    },
    label: {
      textStyle: {
        color: "#eeeeee",
      },
      emphasis: {
        textStyle: {
          color: "#eeeeee",
        },
      },
    },
    emphasis: {
      itemStyle: {
        color: "#495057",
      },
      controlStyle: {
        color: "#eeeeee",
        borderColor: "#eeeeee",
        borderWidth: 0.5,
      },
      label: {
        textStyle: {
          color: "#eeeeee",
        },
      },
    },
  },
  visualMap: {
    color: ["#f64357", "#ffd43b", "#ffffff", "#4285f4"],
  },
  dataZoom: {
    backgroundColor: "rgba(24,28,36,1)",
    dataBackgroundColor: "rgba(45,51,58,1)",
    fillerColor: "rgba(255,255,255,0.06)",
    handleColor: "#495057",
    handleSize: "120%",
    textStyle: {
      color: "#868e96",
    },
  },
  markPoint: {
    label: {
      textStyle: {
        color: "#ffffff",
      },

    },
    emphasis: {
      label: {
        textStyle: {
          color: "#ffffff",
        },
      }
    },
  },
};
const lightCustomed_copy = {
  // color: [
  //   '#71a3f8', '#3366ff', '#3498fd', '#21d3f0',
  //   '#87ce40', '#adce00', '#1098ad', '#8479ea',
  //   '#1f40c0', '#29dcb1', '#00baab', '#eae138',
  //   '#f59f00', '#e8590c', '#e82b40', '#cc2b6c',
  //   '#4e40d5', '#5b7300', '#007558', '#4e9420'
  // ],
  color: ['#8479EA', '#21D3F0', '#4285F4'],
  // title: {
  //   backgroundColor: "#F3F7FD"
  // },
  tooltip: {
    backgroundColor: "#ffffff",
    textStyle: {
      color: "#666666",
    },
  }
};
const lightCustomed = 
{
    "color": [
        "#4285f4",
        "#2eddf9",
        "#8479ea",
        "#87ce40",
        "#49cddc",
        "#5aaef3"
    ],
    "backgroundColor": "rgba(0,0,0,0)",
    "textStyle": {},
    "title": {
        "textStyle": {
            "color": "#333333"
        },
        "subtextStyle": {
            "color": "#999999"
        }
    },
    "line": {
        "itemStyle": {
            "borderWidth": "0"
        },
        "lineStyle": {
            "width": 2
        },
        "symbolSize": "0",
        "symbol": "emptyCircle",
        "smooth": false
    },
    "radar": {
        "itemStyle": {
            "borderWidth": "0"
        },
        "lineStyle": {
            "width": 2
        },
        "symbolSize": "0",
        "symbol": "emptyCircle",
        "smooth": false
    },
    "bar": {
        "itemStyle": {
            "barBorderWidth": 0,
            "barBorderColor": "#cccccc"
        }
    },
    "pie": {
        "itemStyle": {
            "borderWidth": 0,
            "borderColor": "#cccccc"
        }
    },
    "scatter": {
        "itemStyle": {
            "borderWidth": 0,
            "borderColor": "#cccccc"
        }
    },
    "boxplot": {
        "itemStyle": {
            "borderWidth": 0,
            "borderColor": "#cccccc"
        }
    },
    "parallel": {
        "itemStyle": {
            "borderWidth": 0,
            "borderColor": "#cccccc"
        }
    },
    "sankey": {
        "itemStyle": {
            "borderWidth": 0,
            "borderColor": "#cccccc"
        }
    },
    "funnel": {
        "itemStyle": {
            "borderWidth": 0,
            "borderColor": "#cccccc"
        }
    },
    "gauge": {
        "itemStyle": {
            "borderWidth": 0,
            "borderColor": "#cccccc"
        }
    },
    "candlestick": {
        "itemStyle": {
            "color": "#eb5454",
            "color0": "#47b262",
            "borderColor": "#eb5454",
            "borderColor0": "#47b262",
            "borderWidth": 1
        }
    },
    "graph": {
        "itemStyle": {
            "borderWidth": 0,
            "borderColor": "#cccccc"
        },
        "lineStyle": {
            "width": 1,
            "color": "#aaa"
        },
        "symbolSize": "0",
        "symbol": "emptyCircle",
        "smooth": false,
        "color": [
            "#4285f4",
            "#2eddf9",
            "#8479ea",
            "#87ce40",
            "#49cddc",
            "#5aaef3"
        ],
        "label": {
            "color": "#ffffff"
        }
    },
    "map": {
        "itemStyle": {
            "areaColor": "#eee",
            "borderColor": "#444",
            "borderWidth": 0.5
        },
        "label": {
            "color": "#000"
        },
        "emphasis": {
            "itemStyle": {
                "areaColor": "rgba(255,215,0,0.8)",
                "borderColor": "#444",
                "borderWidth": 1
            },
            "label": {
                "color": "rgb(100,0,0)"
            }
        }
    },
    "geo": {
        "itemStyle": {
            "areaColor": "#eee",
            "borderColor": "#444",
            "borderWidth": 0.5
        },
        "label": {
            "color": "#000"
        },
        "emphasis": {
            "itemStyle": {
                "areaColor": "rgba(255,215,0,0.8)",
                "borderColor": "#444",
                "borderWidth": 1
            },
            "label": {
                "color": "rgb(100,0,0)"
            }
        }
    },
    "categoryAxis": {
        "axisLine": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisTick": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisLabel": {
            "show": true,
            "color": "#999999"
        },
        "splitLine": {
            "show": false,
            "lineStyle": {
                "color": [
                    "#E0E6F1"
                ]
            }
        },
        "splitArea": {
            "show": false,
            "areaStyle": {
                "color": [
                    "rgba(250,250,250,0.2)",
                    "rgba(210,219,238,0.2)"
                ]
            }
        }
    },
    "valueAxis": {
        "axisLine": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisTick": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisLabel": {
            "show": true,
            "color": "#999999"
        },
        "splitLine": {
            "show": true,
            "lineStyle": {
                "color": [
                    "#dee2e7"
                ]
            }
        },
        "splitArea": {
            "show": false,
            "areaStyle": {
                "color": [
                    "rgba(250,250,250,0.2)",
                    "rgba(210,219,238,0.2)"
                ]
            }
        }
    },
    "logAxis": {
        "axisLine": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisTick": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisLabel": {
            "show": true,
            "color": "#999999"
        },
        "splitLine": {
            "show": true,
            "lineStyle": {
                "color": [
                    "#dee2e7"
                ]
            }
        },
        "splitArea": {
            "show": false,
            "areaStyle": {
                "color": [
                    "rgba(250,250,250,0.2)",
                    "rgba(210,219,238,0.2)"
                ]
            }
        }
    },
    "timeAxis": {
        "axisLine": {
            "show": true,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisTick": {
            "show": true,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisLabel": {
            "show": true,
            "color": "#6E7079"
        },
        "splitLine": {
            "show": false,
            "lineStyle": {
                "color": [
                    "#E0E6F1"
                ]
            }
        },
        "splitArea": {
            "show": false,
            "areaStyle": {
                "color": [
                    "rgba(250,250,250,0.2)",
                    "rgba(210,219,238,0.2)"
                ]
            }
        }
    },
    "toolbox": {
        "iconStyle": {
            "borderColor": "#999"
        },
        "emphasis": {
            "iconStyle": {
                "borderColor": "#666"
            }
        }
    },
    "legend": {
        "textStyle": {
            "color": "#666666"
        }
    },
    "tooltip": {
        "axisPointer": {
            "lineStyle": {
                "color": "#ccc",
                "width": 1
            },
            "crossStyle": {
                "color": "#ccc",
                "width": 1
            }
        }
    },
    "timeline": {
        "lineStyle": {
            "color": "#DAE1F5",
            "width": 2
        },
        "itemStyle": {
            "color": "#A4B1D7",
            "borderWidth": 1
        },
        "controlStyle": {
            "color": "#A4B1D7",
            "borderColor": "#A4B1D7",
            "borderWidth": 1
        },
        "checkpointStyle": {
            "color": "#316bf3",
            "borderColor": "fff"
        },
        "label": {
            "color": "#A4B1D7"
        },
        "emphasis": {
            "itemStyle": {
                "color": "#FFF"
            },
            "controlStyle": {
                "color": "#A4B1D7",
                "borderColor": "#A4B1D7",
                "borderWidth": 1
            },
            "label": {
                "color": "#A4B1D7"
            }
        }
    },
    "visualMap": {
        "color": [
            "#bf444c",
            "#d88273",
            "#f6efa6"
        ]
    },
    "dataZoom": {
        "handleSize": "undefined%",
        "textStyle": {}
    },
    "markPoint": {
        "label": {
            "color": "#ffffff"
        },
        "emphasis": {
            "label": {
                "color": "#ffffff"
            }
        }
    }
}

const redCustomed_copy = {
  color: ['#9C73FB', '#F8BC2D', '#CE4C1C'],
  // title: {
  //   backgroundColor: "#F3F7FD",
  // },
  tooltip: {
    backgroundColor: "#ffffff",
    textStyle: {
      color: "#666666",
    },
  }
};
const redCustomed = {
    "color": [
        "#ce4c1c",
        "#f8bc2d",
        "#8479ea",
        "#f48038",
        "#fff021"
    ],
    "backgroundColor": "rgba(0,0,0,0)",
    "textStyle": {},
    "title": {
        "textStyle": {
            "color": "#333333"
        },
        "subtextStyle": {
            "color": "#999999"
        }
    },
    "line": {
        "itemStyle": {
            "borderWidth": "0"
        },
        "lineStyle": {
            "width": 2
        },
        "symbolSize": "0",
        "symbol": "emptyCircle",
        "smooth": false
    },
    "radar": {
        "itemStyle": {
            "borderWidth": "0"
        },
        "lineStyle": {
            "width": 2
        },
        "symbolSize": "0",
        "symbol": "emptyCircle",
        "smooth": false
    },
    "bar": {
        "itemStyle": {
            "barBorderWidth": "0",
            "barBorderColor": "#cccccc"
        }
    },
    "pie": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#cccccc"
        }
    },
    "scatter": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#cccccc"
        }
    },
    "boxplot": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#cccccc"
        }
    },
    "parallel": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#cccccc"
        }
    },
    "sankey": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#cccccc"
        }
    },
    "funnel": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#cccccc"
        }
    },
    "gauge": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#cccccc"
        }
    },
    "candlestick": {
        "itemStyle": {
            "color": "#eb5454",
            "color0": "#47b262",
            "borderColor": "#eb5454",
            "borderColor0": "#47b262",
            "borderWidth": 1
        }
    },
    "graph": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#cccccc"
        },
        "lineStyle": {
            "width": 1,
            "color": "#aaa"
        },
        "symbolSize": "0",
        "symbol": "emptyCircle",
        "smooth": false,
        "color": [
            "#ce4c1c",
            "#f8bc2d",
            "#8479ea",
            "#f48038",
            "#fff021"
        ],
        "label": {
            "color": "#ffffff"
        }
    },
    "map": {
        "itemStyle": {
            "areaColor": "#eee",
            "borderColor": "#444",
            "borderWidth": 0.5
        },
        "label": {
            "color": "#000"
        },
        "emphasis": {
            "itemStyle": {
                "areaColor": "rgba(255,215,0,0.8)",
                "borderColor": "#444",
                "borderWidth": 1
            },
            "label": {
                "color": "rgb(100,0,0)"
            }
        }
    },
    "geo": {
        "itemStyle": {
            "areaColor": "#eee",
            "borderColor": "#444",
            "borderWidth": 0.5
        },
        "label": {
            "color": "#000"
        },
        "emphasis": {
            "itemStyle": {
                "areaColor": "rgba(255,215,0,0.8)",
                "borderColor": "#444",
                "borderWidth": 1
            },
            "label": {
                "color": "rgb(100,0,0)"
            }
        }
    },
    "categoryAxis": {
        "axisLine": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisTick": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisLabel": {
            "show": true,
            "color": "#999999"
        },
        "splitLine": {
            "show": false,
            "lineStyle": {
                "color": [
                    "#E0E6F1"
                ]
            }
        },
        "splitArea": {
            "show": false,
            "areaStyle": {
                "color": [
                    "rgba(250,250,250,0.2)",
                    "rgba(210,219,238,0.2)"
                ]
            }
        }
    },
    "valueAxis": {
        "axisLine": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisTick": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisLabel": {
            "show": true,
            "color": "#999999"
        },
        "splitLine": {
            "show": true,
            "lineStyle": {
                "color": [
                    "#dee2e7"
                ]
            }
        },
        "splitArea": {
            "show": false,
            "areaStyle": {
                "color": [
                    "rgba(250,250,250,0.2)",
                    "rgba(210,219,238,0.2)"
                ]
            }
        }
    },
    "logAxis": {
        "axisLine": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisTick": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisLabel": {
            "show": true,
            "color": "#6E7079"
        },
        "splitLine": {
            "show": true,
            "lineStyle": {
                "color": [
                    "#dee2e7"
                ]
            }
        },
        "splitArea": {
            "show": false,
            "areaStyle": {
                "color": [
                    "rgba(250,250,250,0.2)",
                    "rgba(210,219,238,0.2)"
                ]
            }
        }
    },
    "timeAxis": {
        "axisLine": {
            "show": true,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisTick": {
            "show": true,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisLabel": {
            "show": true,
            "color": "#6E7079"
        },
        "splitLine": {
            "show": false,
            "lineStyle": {
                "color": [
                    "#E0E6F1"
                ]
            }
        },
        "splitArea": {
            "show": false,
            "areaStyle": {
                "color": [
                    "rgba(250,250,250,0.2)",
                    "rgba(210,219,238,0.2)"
                ]
            }
        }
    },
    "toolbox": {
        "iconStyle": {
            "borderColor": "#999"
        },
        "emphasis": {
            "iconStyle": {
                "borderColor": "#666"
            }
        }
    },
    "legend": {
        "textStyle": {
            "color": "#666666"
        }
    },
    "tooltip": {
        "axisPointer": {
            "lineStyle": {
                "color": "#ccc",
                "width": 1
            },
            "crossStyle": {
                "color": "#ccc",
                "width": 1
            }
        }
    },
    "timeline": {
        "lineStyle": {
            "color": "#DAE1F5",
            "width": 2
        },
        "itemStyle": {
            "color": "#A4B1D7",
            "borderWidth": 1
        },
        "controlStyle": {
            "color": "#A4B1D7",
            "borderColor": "#A4B1D7",
            "borderWidth": 1
        },
        "checkpointStyle": {
            "color": "#316bf3",
            "borderColor": "fff"
        },
        "label": {
            "color": "#A4B1D7"
        },
        "emphasis": {
            "itemStyle": {
                "color": "#FFF"
            },
            "controlStyle": {
                "color": "#A4B1D7",
                "borderColor": "#A4B1D7",
                "borderWidth": 1
            },
            "label": {
                "color": "#A4B1D7"
            }
        }
    },
    "visualMap": {
        "color": [
            "#bf444c",
            "#d88273",
            "#f6efa6"
        ]
    },
    "dataZoom": {
        "handleSize": "undefined%",
        "textStyle": {}
    },
    "markPoint": {
        "label": {
            "color": "#ffffff"
        },
        "emphasis": {
            "label": {
                "color": "#ffffff"
            }
        }
    }
}

const greenCustomed = {
    "color": [
        "#37c2ce",
        "#ff922b",
        "#4ea6ff",
        "#1faaad",
        "#ffbf00"
    ],
    "backgroundColor": "rgba(0, 0, 0, 0)",
    "textStyle": {},
    "title": {
        "textStyle": {
            "color": "#323333"
        },
        "subtextStyle": {
            "color": "#6E7079"
        }
    },
    "line": {
        "itemStyle": {
            "borderWidth": "0"
        },
        "lineStyle": {
            "width": "2"
        },
        "symbolSize": "0",
        "symbol": "emptyCircle",
        "smooth": false
    },
    "radar": {
        "itemStyle": {
            "borderWidth": "0"
        },
        "lineStyle": {
            "width": "2"
        },
        "symbolSize": "0",
        "symbol": "emptyCircle",
        "smooth": false
    },
    "bar": {
        "itemStyle": {
            "barBorderWidth": "0",
            "barBorderColor": "#ff4d4d"
        }
    },
    "pie": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#ff4d4d"
        }
    },
    "scatter": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#ff4d4d"
        }
    },
    "boxplot": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#ff4d4d"
        }
    },
    "parallel": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#ff4d4d"
        }
    },
    "sankey": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#ff4d4d"
        }
    },
    "funnel": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#ff4d4d"
        }
    },
    "gauge": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#ff4d4d"
        }
    },
    "candlestick": {
        "itemStyle": {
            "color": "#eb5454",
            "color0": "#47b262",
            "borderColor": "#eb5454",
            "borderColor0": "#47b262",
            "borderWidth": 1
        }
    },
    "graph": {
        "itemStyle": {
            "borderWidth": "0",
            "borderColor": "#ff4d4d"
        },
        "lineStyle": {
            "width": 1,
            "color": "#aaa"
        },
        "symbolSize": "0",
        "symbol": "emptyCircle",
        "smooth": false,
        "color": [
            "#37c2ce",
            "#ff922b",
            "#4ea6ff",
            "#1faaad",
            "#ffbf00"
        ],
        "label": {
            "color": "#ffffff"
        }
    },
    "map": {
        "itemStyle": {
            "areaColor": "#eee",
            "borderColor": "#444",
            "borderWidth": 0.5
        },
        "label": {
            "color": "#000"
        },
        "emphasis": {
            "itemStyle": {
                "areaColor": "rgba(255,215,0,0.8)",
                "borderColor": "#444",
                "borderWidth": 1
            },
            "label": {
                "color": "rgb(100,0,0)"
            }
        }
    },
    "geo": {
        "itemStyle": {
            "areaColor": "#eee",
            "borderColor": "#444",
            "borderWidth": 0.5
        },
        "label": {
            "color": "#000"
        },
        "emphasis": {
            "itemStyle": {
                "areaColor": "rgba(255,215,0,0.8)",
                "borderColor": "#444",
                "borderWidth": 1
            },
            "label": {
                "color": "rgb(100,0,0)"
            }
        }
    },
    "categoryAxis": {
        "axisLine": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisTick": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisLabel": {
            "show": true,
            "color": "#969999"
        },
        "splitLine": {
            "show": false,
            "lineStyle": {
                "color": [
                    "#E0E6F1"
                ]
            }
        },
        "splitArea": {
            "show": false,
            "areaStyle": {
                "color": [
                    "rgba(250,250,250,0.2)",
                    "rgba(210,219,238,0.2)"
                ]
            }
        }
    },
    "valueAxis": {
        "axisLine": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisTick": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisLabel": {
            "show": true,
            "color": "#969999"
        },
        "splitLine": {
            "show": true,
            "lineStyle": {
                "color": [
                    "#e9e9e9"
                ]
            }
        },
        "splitArea": {
            "show": false,
            "areaStyle": {
                "color": [
                    "rgba(250,250,250,0.2)",
                    "rgba(210,219,238,0.2)"
                ]
            }
        }
    },
    "logAxis": {
        "axisLine": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisTick": {
            "show": false,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisLabel": {
            "show": true,
            "color": "#6E7079"
        },
        "splitLine": {
            "show": true,
            "lineStyle": {
                "color": [
                    "#E0E6F1"
                ]
            }
        },
        "splitArea": {
            "show": false,
            "areaStyle": {
                "color": [
                    "rgba(250,250,250,0.2)",
                    "rgba(210,219,238,0.2)"
                ]
            }
        }
    },
    "timeAxis": {
        "axisLine": {
            "show": true,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisTick": {
            "show": true,
            "lineStyle": {
                "color": "#6E7079"
            }
        },
        "axisLabel": {
            "show": true,
            "color": "#6E7079"
        },
        "splitLine": {
            "show": false,
            "lineStyle": {
                "color": [
                    "#E0E6F1"
                ]
            }
        },
        "splitArea": {
            "show": false,
            "areaStyle": {
                "color": [
                    "rgba(250,250,250,0.2)",
                    "rgba(210,219,238,0.2)"
                ]
            }
        }
    },
    "toolbox": {
        "iconStyle": {
            "borderColor": "#999"
        },
        "emphasis": {
            "iconStyle": {
                "borderColor": "#666"
            }
        }
    },
    "legend": {
        "textStyle": {
            "color": "#505050"
        }
    },
    "tooltip": {
        "axisPointer": {
            "lineStyle": {
                "color": "#ccc",
                "width": 1
            },
            "crossStyle": {
                "color": "#ccc",
                "width": 1
            }
        }
    },
    "timeline": {
        "lineStyle": {
            "color": "#DAE1F5",
            "width": 2
        },
        "itemStyle": {
            "color": "#A4B1D7",
            "borderWidth": 1
        },
        "controlStyle": {
            "color": "#A4B1D7",
            "borderColor": "#A4B1D7",
            "borderWidth": 1
        },
        "checkpointStyle": {
            "color": "#316bf3",
            "borderColor": "fff"
        },
        "label": {
            "color": "#A4B1D7"
        },
        "emphasis": {
            "itemStyle": {
                "color": "#FFF"
            },
            "controlStyle": {
                "color": "#A4B1D7",
                "borderColor": "#A4B1D7",
                "borderWidth": 1
            },
            "label": {
                "color": "#A4B1D7"
            }
        }
    },
    "visualMap": {
        "color": [
            "#bf444c",
            "#d88273",
            "#f6efa6"
        ]
    },
    "dataZoom": {
        "handleSize": "undefined%",
        "textStyle": {}
    },
    "markPoint": {
        "label": {
            "color": "#ffffff"
        },
        "emphasis": {
            "label": {
                "color": "#ffffff"
            }
        }
    }
}

const greenCustomed_copy = {
  color: ['#1FAAAD', '#58D0D3', '#4EA6FF'],
  // title: {
  //   backgroundColor: "#F3F7FD",
  // },
  tooltip: {
    backgroundColor: "#ffffff",
    textStyle: {
      color: "#666666",
    },
  }
};
echarts.registerTheme("dark", darkCustomed);
echarts.registerTheme("light", lightCustomed);
echarts.registerTheme("red", redCustomed);
echarts.registerTheme("green", greenCustomed);
