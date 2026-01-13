/*
 * @Author: duyibo
 * @Date: 2024-05-09 11:37:03
 * @LastEditors: Do not edit
 * @LastEditTime: 2024-05-11 13:30:15
 * @Description:
 */

export const option = {
  grid: [
    {
      left: '16px',
      right: '12px',
      top: '18%',
      bottom: '3%',
      containLabel: true
    }
  ],
  legend: {
    top: 'top',
    left: 'right',
    icon: 'rect',
    itemHeight: 6,
    itemWidth: 8,
    textStyle: {
      fontSize: '12px',
      color: '#000000'
    }
  },
  xAxis: [
    {
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: 'rgba(0,0,0,0.5)'
        }
      },
      axisLabel: {
        color: '#979797',
        fontSize: 12
      },
      type: 'category',
      data: []
    }
  ],
  yAxis: [
    {
      name: '',
      splitLine: {
        lineStyle: {
          type: 'dashed'
        },
        show: true
      }
    }
  ],
  dataZoom: [
    {
      type: 'inside'
    }
  ],
  series: []
};
