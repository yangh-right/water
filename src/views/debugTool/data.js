/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-11 15:54:51
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-05-15 11:04:21
 * @Description:
 */
import {
  inCarbonSourceWater,
  outCarbonSourceWater,
  processCarbonSourceWater,
  carbonSourceAddedList,
  inPWater,
  outPWater,
  processpPWater,
  pAddedList
} from '@/api/optimization';
import { queryPointHistoryData } from '@/api/cockpit.js';

export const SolutionTypeMap = {
  '3': {
    inWaterApi: inCarbonSourceWater,
    outWaterApi: outCarbonSourceWater,
    processWaterApi: processCarbonSourceWater,
    addListApi: carbonSourceAddedList,
    addTitle: '碳源投加量',
    loadId: 'carbonLoad',
    dosingBus: 'carbonBus',
    showTitleRadio: true,
    templateName: '智能加药'
  },
  '5': {
    inWaterApi: inPWater,
    outWaterApi: outPWater,
    processWaterApi: queryPointHistoryData,
    addListApi: pAddedList,
    addTitle: '除磷投加量',
    dosingBus: 'phosphorusBus',
    loadId: 'phosphorusLoad',
    showTitleRadio: false,
    templateName: '智能除磷'
  }
};
export function genCommonOption(config = {}) {
  return {
    grid: [
      {
        left: '16px',
        right: '12px',
        top: '40px',
        bottom: '12px',
        containLabel: true
      }
    ],
    legend: {
      show: true,
      top: 6,
      right: 6,
      icon: 'rect',
      itemHeight: 2,
      itemWidth: 12
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: [
      {
        axisLabel: {
          rotate: config.xAxisRotate ?? 0,
          formatter: config.xAxisLabelFormat
        },
        axisLine: {
          show: false,
          lineStyle: {
            // color: "#354050"
          }
        },
        data: config.xData || []
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: config.yAxisName || '',
        splitLine: {
          lineStyle: {
            // color: '#141618'
          }
        },
        axisLabel: {
          // color: '#8C99A6'
        },
        nameTextStyle: {
          align: 'right'
          // color: '#8C99A6',
        }
      }
    ]
  };
}
