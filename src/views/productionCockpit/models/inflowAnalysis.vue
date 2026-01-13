<!--
 * @Author: wangyr
 * @Date: 2023-09-05 10:30:42
 * @LastEditors: wangyr
 * @LastEditTime: 2025-04-08 09:05:37
 * @Description:
-->
<template>
  <!-- 使用单位卡片组件，传递卡片标题 -->
  <unit-card :cardTitle="cardTitle">
    <!-- 右侧头部区域，包含日期选择器 -->
    <div class="header-box" slot="headerRight">
      <w-month-picker
        v-model="dateRange"
        @change="initData"
        style="width: 120px;margin-right:0px"
        :allowClear="false"
      />

      <!-- <div class="workforce" @click="goReport">
        <span>详情</span>
        <w-icon type="right" style="margin-left:4px;font-size: 12px;"></w-icon>
      </div> -->
    </div>
    <!-- 主要内容区域 -->
    <div class="card-inner">
      <!-- 最高处理量表格 -->
      <div class="table-box">
        <w-table
          class="tableDevice"
          ref="wTable1"
          :columns="columns1"
          :data-source="dataList1"
          :scroll="{ y: 190 }"
          :pagination="false"
          rowKey="id"
        >
          <!-- 自定义索引列显示 -->
          <template slot="index" slot-scope="text, record">
            <div class="high-text">
              <img
                v-if="text <= 3"
                alt=""
                :src="$require(`@/assets/administrativeCockpit/rank${text}.png`)"
              />
              <div v-else class="text">
                <div class="circle">{{ text }}</div>
              </div>
              <div>{{ record.name }}</div>
            </div>
          </template>
        </w-table>
      </div>
      <!-- 最低处理量表格 -->
      <div class="table-box">
        <w-table
          class="tableDevice"
          ref="wTable2"
          :columns="columns2"
          :data-source="dataList2"
          :scroll="{ y: 190 }"
          :pagination="false"
          rowKey="id"
        >
          <!-- 自定义索引列显示 -->
          <template slot="index" slot-scope="text, record">
            <div class="lower-text">
              <div class="circle">{{ text }}</div>
              <div class="text">{{ record.name }}</div>
            </div>
          </template>
        </w-table>
      </div>
    </div>
  </unit-card>
</template>

<script>
import { assetsRequire } from '@/core/mixins';
import moment from 'moment';
import { inletFlowAnalysis } from '@/api/cockpit';
export default {
  name: 'inflowAnalysis',
  components: {
    UnitCard: () => import('@/components/CardBox/CockpitCard.vue') // 单位卡片组件
  },
  mixins: [assetsRequire], // 使用资源混入
  props: {
    // 水厂ID
    waterPlantId: {
      type: String,
      default: ''
    },
    // 卡片标题
    cardTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      dateRange: moment(), // 日期范围
      // 最高处理量表格列配置
      columns1: [
        {
          title: '最高处理量',
          key: 'index',
          dataIndex: 'index',
          scopedSlots: { customRender: 'index' }
        }
      ],
      dataList1: [], // 最高处理量数据
      // 最低处理量表格列配置
      columns2: [
        {
          title: '最低处理量',
          key: 'index',
          dataIndex: 'index',
          scopedSlots: { customRender: 'index' }
        }
      ],
      dataList2: [] // 最低处理量数据
    };
  },
  watch: {
    // 监听水厂ID变化
    waterPlantId: {
      handler(val) {
        if (val) {
          this.initData();
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.initData(); // 初始化数据
  },
  methods: {
    // 初始化数据，获取进水流量分析数据
    async initData() {
      let params = {
        endDate: moment(this.dateRange)
          .endOf('month')
          .format('YYYY-MM-DD'),
        queryType: 'month',
        startDate: moment(this.dateRange)
          .startOf('month')
          .format('YYYY-MM-DD'),
        waterPlantId: this.waterPlantId
      };
      let { resultData, status } = await inletFlowAnalysis(params);
      if (status === 'complete') {
        this.dataList1 = resultData?.highList || [];
        this.dataList2 = resultData?.lowList || [];
        this.handleData(this.dataList1);
        this.handleData(this.dataList2);
      }
    },
    // 处理表格数据
    handleData(list) {
      list.forEach((item, i) => {
        item.index = i + 1;
        item.name = `${
          item.dateTime
            ? moment(item.dateTime).month() + 1 + '月' + moment(item.dateTime).date() + '日'
            : ''
        }处理量 ${item.inletFlow ?? '--'}m³`;
      });
    },
    goReport() {
      this.drillDown({
        path: '/report/outflowReport'
      });
    }
  }
};
</script>

<style lang="less" scoped>
.header-box {
  display: flex;
  align-items: center;
}
.workforce {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: PingFangSC-Regular, sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #999999;
  letter-spacing: 0;
  cursor: pointer;
  margin-left: 6px;
}
.card-inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  .table-box {
    width: calc(50% - 6px);
    height: 100%;

    img {
      width: 25px;
      height: 25px;
      margin-right: 5px;
    }
    .high-text {
      display: flex;
      align-items: center;
      .circle {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: rgba(0, 133, 131, 0.2);
        margin-left: 2px;
        margin-right: 8px;
        color: #008583;
        font-size: 13px;
        text-align: center;
        line-height: 20px;
      }
    }
    .lower-text {
      display: flex;
      align-items: center;
      line-height: 25px;
      .circle {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: rgba(246, 67, 87, 0.2);
        margin-right: 8px;
        color: #f64357;
        font-size: 13px;
        text-align: center;
        line-height: 20px;
      }
      .text {
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: var(--supply-color-main);
        letter-spacing: 0;
      }
    }
    /deep/ .wpg-table-tbody > tr > td {
      padding: 6px 16px !important;
    }
  }
}
</style>
