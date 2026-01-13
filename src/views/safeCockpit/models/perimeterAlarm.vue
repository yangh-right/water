<!-- 周界报警监控组件 -->
<template>
  <!-- 使用UnitCard组件作为容器 -->
  <unit-card :cardTitle="cardTitle">
    <!-- 下钻详情 -->
    <div slot="headerRight" class="workforce" @click="goTeamManage">
      <span>详情</span>
      <w-icon type="right" style="margin-left:4px;font-size: 12px;"></w-icon>
    </div>
    <!-- 内容区域 -->
    <div class="card-inner">
      <!-- 表格展示数据 -->
      <w-table
        class="tableDevice"
        ref="wTable"
        :columns="columns"
        :data-source="dataList"
        :scroll="{ y: 190 }"
        :pagination="false"
      ></w-table>
    </div>
  </unit-card>
</template>

<script>
// 导入API
import { getSectorsList } from '@/api/cockpit';

export default {
  name: 'perimeterAlarm',
  components: {
    UnitCard: () => import('@/components/CardBox/CockpitCard.vue')
  },
  props: {
    waterPlantId: {
      type: String,
      default: ''
    },
    cardTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // 数据列表
      dataList: [],
      // 表格列配置
      columns: [
        {
          title: '设备名称',
          dataIndex: 'deviceName'
        },
        {
          title: '防区名称',
          dataIndex: 'sectorsName'
        },
        {
          title: '防区类型',
          dataIndex: 'sectorsTypeName'
        },
        {
          title: '防区状态',
          dataIndex: 'statusTypeName'
        }
      ]
    };
  },
  mounted() {
    this.initData();
  },
  methods: {
    // 初始化数据
    async initData() {
      const { resultData, status } = await getSectorsList();
      if (status === 'complete') {
        this.dataList = resultData || [];
      }
    },
    // 跳转到班组管理
    goTeamManage() {
      this.drillDown({
        path: '/regionAlarm'
      });
    }
  }
};
</script>

<style lang="less" scoped>
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
}
/* 样式部分 */
.card-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .label {
    padding: 1px 6px;
    background: #ffc3431a;
    border: 1px solid #eba000;
    line-height: 20px;
    text-align: center;
    border-radius: 2px;
    font-weight: 400;
    font-size: 14px;
    color: #eba000;
    letter-spacing: 0;
    &.label1 {
      color: #00b445;
      background: #00d48d1a;
      border: 1px solid #06c650;
    }
  }
}
</style>
