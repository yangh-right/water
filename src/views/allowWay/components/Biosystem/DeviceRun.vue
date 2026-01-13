<!--
 * @Description: 设备运行KPI组件 - 显示设备运行状态、故障统计和设备完好率
 * @version: 1.0.0
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-08-07 13:58:03
-->
<template>
  <div class="content">
    <!-- 组件标题头部 -->
    <div class="content-header">
      <div class="content-title">设备运行KPI</div>
    </div>

    <!-- 加载状态包装器 -->
    <w-spin :spinning="loading" class="spin">
      <div class="device-wrap">
        <!-- 图表区域 - 显示设备运行状态饼图 -->
        <div class="chart-wrapper">
          <div v-if="pointsArr.length > 0" class="card-inner">
            <!-- 饼图显示区域 -->
            <div class="echart-block">
              <pie-chart ref="alarmChart" :option="deviceOption"> </pie-chart>
            </div>
            <!-- 数据点列表 - 显示各状态设备数量 -->
            <div class="points-list">
              <div v-for="(item, i) in pointsArr" :key="item.name" class="point-tab">
                <div class="label">
                  <!-- 状态指示器图标 -->
                  <span class="ico-react" :style="{ background: colors[i] }"></span>{{ item.name }}
                </div>
                <div class="precent">{{ item.value }}次</div>
              </div>
            </div>
          </div>
          <!-- 无数据时显示空状态 -->
          <w-empty v-else class="empty"></w-empty>
        </div>

        <!-- 第一个进度环 - 设备完好率 -->
        <div class="device-progress">
          <div class="progress__title">
            设备完好率
          </div>
          <w-progress
            :stroke-color="{
              '0%': '#5CB6FF',
              '100%': '#2F7FFF'
            }"
            type="circle"
            :strokeWidth="10"
            :percent="75"
          />
        </div>

        <!-- 第二个进度环 - 设备完好率（重复显示，可能是不同指标） -->
        <div class="device-progress">
          <div class="progress__title">
            设备完好率
          </div>
          <w-progress
            :stroke-color="{
              '0%': '#52EFCA',
              '100%': '#0ACC9D'
            }"
            type="circle"
            :strokeWidth="10"
            :percent="75"
          />
        </div>
      </div>
    </w-spin>
  </div>
</template>

<script>
import { getAlarmTypeCount } from '@/api/optimization';
import { deviceOption } from './data';

export default {
  name: 'DeviceRun',

  // 组件属性定义
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    }
  },

  // 组件依赖
  components: {
    PieChart: () => import('@/components/chart/PieChart.vue')
  },

  // 组件数据
  data() {
    return {
      loading: false, // 加载状态标识
      timeOption: 'day', // 当前选中的时间选项
      timeOptions: [
        {
          label: '1天',
          value: 'day'
        },
        {
          label: '3天',
          value: 'days'
        },
        {
          label: '1周',
          value: 'week'
        }
      ],
      colors: [
        '#2F7FFF', // 蓝色
        '#FF6781', // 红色
        '#28D6FE', // 青色
        '#FFA66D', // 橙色
        '#2BDEAB', // 绿色
        '#FFD739', // 黄色
        '#A259F5', // 紫色
        '#F9D54A', // 金黄色
        '#0171CE' // 深蓝色
      ],
      // 设备状态数据数组
      pointsArr: [
        { name: '设备运行', value: 125 },
        { name: '故障设备', value: 8 },
        { name: '停机设备', value: 13 },
        { name: '维修设备', value: 24 }
      ],
      deviceOption, // 饼图配置选项
      endTime: '', // 结束时间
      startTime: '', // 开始时间
      type: '1' // 时间类型标识
    };
  },

  // 监听器
  watch: {
    // 监听水厂ID变化，重新获取告警数据
    waterPlantId() {
      this.getAlarmType();
    }
  },

  // 组件创建时执行
  created() {
    // 设置默认时间范围：昨天到当前时间
    this.startTime = this.$moment()
      .subtract(1, 'day')
      .format('YYYY-MM-DD HH:mm:ss');
    this.endTime = this.$moment().format('YYYY-MM-DD HH:mm:ss');
  },

  // 组件方法
  methods: {
    /**
     * 时间选项变化处理
     * 根据选择的时间范围更新查询参数
     */
    optionsChange() {
      if (this.timeOption === 'day') {
        this.type = '1';
        this.startTime = this.$moment()
          .subtract(1, 'day')
          .format('YYYY-MM-DD HH:mm:ss');
      } else if (this.timeOption === 'days') {
        this.type = '2';
        this.startTime = this.$moment()
          .subtract(3, 'day')
          .format('YYYY-MM-DD HH:mm:ss');
      } else {
        this.type = '3';
        this.startTime = this.$moment()
          .subtract(7, 'day')
          .format('YYYY-MM-DD HH:mm:ss');
      }
      // 重新获取告警数据
      this.getAlarmType();
    },

    /**
     * 获取告警类型统计数据
     * 异步请求设备运行状态数据并更新图表
     */
    async getAlarmType() {
      this.loading = true;
      // 构建请求参数
      let param = {
        waterPlantId: this.waterPlantId,
        startTime: this.startTime,
        endTime: this.endTime
      };

      // 调用API获取数据
      let { resultData, status } = await getAlarmTypeCount(param);
      this.loading = false;

      // 处理返回数据
      if (status === 'complete') {
        this.pointsArr = resultData;
        // 将count字段映射为value字段
        this.pointsArr.forEach(item => {
          item['value'] = item.count;
        });
        // 更新饼图数据
        this.deviceOption.series[0].data = this.pointsArr;
      }
    }
  }
};
</script>

<style lang="less" scoped>
/* 主容器样式 */
.content {
  height: 312px;
  width: calc(50% - 6px);
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;

  /* 头部样式 */
  &-header {
    width: 100%;
    padding: 15px 12px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
  }

  /* 标题样式 */
  &-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }

  /* 表单样式 */
  .form {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-item {
    margin-top: 10px;
    margin-left: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* 加载状态样式 */
  .spin {
    height: calc(100% - 40px);

    /* 设备包装器样式 */
    .device-wrap {
      padding: 0 12px 12px;
      height: 100%;
      display: flex;

      /* 图表包装器样式 */
      .chart-wrapper {
        width: 50%;

        /* 卡片内部样式 */
        .card-inner {
          width: 100%;
          height: 100%;
          position: relative;
          padding: 0 12px 0 0;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;

          /* 图表块样式 */
          .echart-block {
            height: calc(100% - 68px);
            width: 100%;
            text-align: center;
          }

          /* 数据点列表样式 */
          .points-list {
            height: 68px;
            width: 100%;
            display: flex;
            overflow-y: auto;
            flex-flow: wrap;
            align-items: center;
            justify-content: flex-start;

            /* 数据点标签样式 */
            .point-tab {
              width: calc(50% - 14px);
              height: 26px;
              margin-top: 8px;
              padding: 0 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-right: 28px;

              /* 偶数项右边距为0 */
              &:nth-child(2n) {
                margin-right: 0px;
              }

              /* 标签样式 */
              .label {
                font-family: PingFangSC-Regular, sans-serif;
                font-weight: 400;
                font-size: 14px;
                color: var(--supply-color-secondary);
                letter-spacing: 0;

                /* 状态指示器图标样式 */
                .ico-react {
                  display: inline-block;
                  width: 10px;
                  height: 10px;
                  border-radius: 1.76px;
                  margin-right: 6px;
                }
              }

              /* 百分比数值样式 */
              .precent {
                font-weight: 400;
                font-size: 14px;
                color: var(--supply-color-main);
                letter-spacing: 0;
                text-align: right;
              }
            }
          }
        }
      }

      /* 设备进度环样式 */
      .device-progress {
        align-items: center;
        flex-direction: column;
        display: flex;
        padding: 12px;
        height: 100%;
        width: calc(25% - 6px);

        /* 进度环标题样式 */
        .progress__title {
          align-self: flex-start;
          font-weight: 400;
          font-size: 14px;
          margin-bottom: 48px;
          color: var(--supply-color-main);
          letter-spacing: 0;
        }

        /* 最后一个进度环左边距 */
        &:nth-last-child(1) {
          margin-left: 12px;
        }
      }
    }
  }

  /* 图表包装器高度 */
  .chart-wrapper {
    height: 100%;
  }

  /* 空状态样式 */
  .empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* 深度选择器样式覆盖 */
  /deep/ .wpg-select-selection--single {
    height: 32px;
  }

  /deep/ .wpg-spin-container {
    height: 100%;
  }

  /deep/ .wpg-select {
    width: 120px !important;
  }
}
</style>
