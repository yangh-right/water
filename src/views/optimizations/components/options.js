export const inWaterOption = {
  grid: [
    {
      left: '8%',
      right: '8%',
      top: '10%',
      bottom: '10%',
      containLabel: true
    }
  ],
  color: ['#65dbb1', '#6791f1'],
  legend: {
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: [
    {
      data: []
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: '',
    }
  ],
  series: [
    {
      name: 'COD',
      data: [],
      type: 'line',
      smooth: true,
    },
    {
      name: '预测量',
      data: [],
      type: 'line',
      smooth: true,
    }
  ]
};
export const outWaterOption = {
  grid: [
    {
      left: '8%',
      right: '8%',
      top: '10%',
      bottom: '10%',
      containLabel: true
    }
  ],
  color: ['#efa14f', '#648de4'],
  legend: {
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: [
    {
      data: []
    }
  ],
  yAxis: [
    {
      name: ''
    }
  ],
  series: [
    {
      name: '',
      data: [],
      smooth: true,
      type: 'line'
    },
    {
      name: '预测量',
      data: [],
      smooth: true,
      type: 'line'
    }
  ]
};
export const mlssOption = {
  grid: [
    {
      left: '8%',
      right: '8%',
      top: '10%',
      bottom: '30',
      containLabel: true
    }
  ],
  color: ['#648de4', '#65dbb1', '#efa14f'],
  legend: {
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: [
    {
      data: []
    }
  ],
  yAxis: [
    {
      name: 'mg/L'
    }
  ],
  series: [
    {
      name: 'MLSS',
      data: [],
      smooth: true,
      type: 'line'
    },
    {
      name: 'MLSS实时',
      data: [],
      smooth: true,
      type: 'line'
    },
    {
      name: 'MLVSS',
      data: [],
      smooth: true,
      type: 'line'
    }
  ]
};
export const waterTempOption = {
  grid: [
    {
      left: '8%',
      right: '8%',
      top: '10%',
      bottom: '30',
      containLabel: true
    }
  ],
  color: ['#648de4', '#65dbb1'],
  legend: {
    top: 'bottom',
    icon: 'rect',
    itemHeight: 2,
    itemWidth: 12
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: [
    {
      data: []
    }
  ],
  yAxis: [
    {
      //    type: 'value',
      name: 'mg/L'
    }
  ],
  series: [
    {
      name: 'DO/水温',
      data: [],
      type: 'line',
      smooth: true
    },
    {
      name: '预测量',
      data: [],
      type: 'line',
      smooth: true
    }
  ]
};
