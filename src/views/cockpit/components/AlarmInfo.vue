<template>
  <div class="card-box">
    <!-- 卡片标题，包含跳转到更多报警/预警页面的按钮 -->
    <div class="card-title">
      报警信息
      <div class="drill-btn" @click="goToPage">
        {{ alarmType === '1' ? '更多报警' : '更多预警' }}
      </div>
    </div>
    <!-- 选项卡，用于切换报警和预警 -->
    <w-tabs v-model="alarmType" size="small" class="tab-con" @change="handleChange">
      <w-tab-pane key="1" tab="报警"></w-tab-pane>
      <w-tab-pane key="2" tab="预警"></w-tab-pane>
    </w-tabs>
    <!-- 表格容器，支持自动滚动 -->
    <div v-on:mouseout="scrollFun" v-on:mouseover="pauseScroll" class="table-container">
      <w-config-provider>
        <!-- 报警/预警信息表格 -->
        <w-table
          class="tableRect"
          ref="wTable"
          :columns="columns"
          :data-source="data"
          :scroll="{ y: 190 }"
          :pagination="false"
          rowKey="alarmHandlerDataId"
        >
        </w-table>
        <!-- 空状态显示 -->
        <template #renderEmpty>
          <w-empty id="ssmal" style="margin:auto" size="small"></w-empty>
        </template>
      </w-config-provider>
    </div>
    <!-- 加载中 -->
    <w-spin :spinning="isLoading" class="chart-spin"></w-spin>
  </div>
</template>

<script>
import { alarmInfo } from '@/api/cockpit.js';
import { getAlarmList } from '@/api/analysis';
import { alarmColumns } from '../models/data';

export default {
  name: 'AlarmInfo',
  components: {},
  props: {
    // 水厂ID
    factoryId: {
      type: String,
      required: true,
      default: ''
    }
  },
  data() {
    return {
      isLoading: false, // 加载状态
      columns: alarmColumns, // 表格列配置
      data: [], // 渲染数据
      alarmData: [], // 报警数据
      earlyWarnData: [], // 预警数据
      scrollTimer: null, // 滚动定时器
      scrollDirection: 'down', // 滚动方向
      alarmType: '1', // 当前选中的报警类型
      request: true // 预警数据是否需要更新
    };
  },
  computed: {},
  watch: {
    // 监听水厂ID变化
    factoryId: {
      handler(val) {
        this.initAlarmData(val);
        this.request = true; // 刷新预警数据
      }
    }
  },
  methods: {
    // 初始化报警数据
    async initAlarmData(id) {
      this.isLoading = true;
      let { status, resultData } = await alarmInfo(id);
      if (status === 'complete') {
        this.isLoading = false;
        this.alarmData = resultData.records || [];
        this.data = this.alarmData;
      }
    },
    // 初始化预警数据
    async initEarlyWarnData() {
      this.data = [];
      this.isLoading = true;
      let param = {
        alarmTypeCode: 'water_purification_yujing',
        alarmLevels: ['1', '2', '3', '4'],
        stationIds: [this.factoryId],
        currentPage: 1,
        pageSize: 999999999
      };
      let { status, resultData } = await getAlarmList(param);
      if (status === 'complete') {
        this.earlyWarnData = resultData.records || [];
      }
    },
    // 处理选项卡切换
    async handleChange() {
      if (this.request) {
        this.request = false;
        await this.initEarlyWarnData();
      }
      // 切换选项卡时，将滚动条滚动到顶部
      document.querySelectorAll(`.tableRect .wpg-table-body`)[0].scrollTop = 0;
      this.data = this.alarmType === '1' ? this.alarmData : this.earlyWarnData;
      this.isLoading = false;
      // 启动表格内容滚动
      setTimeout(() => {
        this.scrollFun();
      }, 1000);
    },
    // 跳转到更多报警/预警页面
    goToPage() {
      let path = this.alarmType === '1' ? '/alarmCenter' : '/warningAlarm';
      this.drillDown({
        path
      });
    },
    // 自动滚动表格内容
    scrollFun() {
      if (this.data.length <= 5) {
        return false;
      }
      // 如果定时器存在，则先清除
      if (this.scrollTimer) {
        clearInterval(this.scrollTimer);
        this.scrollTimer = null;
      }
      // 设置定时器，实现表格内容自动滚动
      this.scrollTimer = setInterval(() => {
        const scrollHeight = document.querySelectorAll(`.tableRect .wpg-table-body`)[0]
          .scrollHeight;
        const clientHeight = document.querySelectorAll(`.tableRect .wpg-table-body`)[0]
          .clientHeight;
        if (clientHeight === 0) {
          return false;
        }
        const scroll = scrollHeight - clientHeight;
        const scrollTop = document.querySelectorAll(`.tableRect .wpg-table-body`)[0].scrollTop;
        // 向下滚动
        if (this.scrollDirection === 'down') {
          const temp = scrollTop + 2; // 滚动速度
          document.querySelectorAll(`.tableRect .wpg-table-body`)[0].scrollTop = temp;
          // 滚动到底部时，停止滚动并触发数据更新
          if (scroll <= temp) {
            clearInterval(this.scrollTimer);
            this.scrollTimer = null;
            this.handleChange(this.factoryId);
          }
        }
      }, 300);
    },
    // 停止滚动
    pauseScroll() {
      if (this.scrollTimer) {
        clearInterval(this.scrollTimer);
        this.scrollTimer = null;
      }
    }
  },
  // 组件激活时启动滚动
  activated() {
    this.scrollFun();
  },
  // 组件停用时停止滚动
  deactivated() {
    if (this.scrollTimer) {
      clearInterval(this.scrollTimer);
      this.scrollTimer = null;
    }
  },
  // 组件销毁前停止滚动
  beforeDestroy() {
    if (this.scrollTimer) {
      clearInterval(this.scrollTimer);
      this.scrollTimer = null;
    }
  }
};
</script>

<style lang="less" scoped>
/deep/ .wpg-tabs-bar {
  margin-bottom: 0px !important;
}
.chart-spin {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);
}
.card-title {
  position: relative;
}
.drill-btn {
  position: absolute;
  color: var(--supply-color-primary-DEFAULT);
  font-weight: 400;
  top: 36px;
  right: 6px;
  cursor: pointer;
  font-size: 12px;
  z-index: 12;
}
.drill-btn:hover {
  opacity: 0.7;
}
.btn-status {
  width: 48px;
  height: 22px;
  border-radius: 2px;
  text-align: center;
  line-height: 22px;
  font-family: PingFangSC-Regular, sans-serif;
  font-weight: 400;
  font-size: 12px;
  letter-spacing: 0;
}
.btn-active {
  background: #f6435740;
  color: #f64357;
}
.btn-stop {
  background: #0000001a;
  color: #ffffff;
}
.ico-done {
  display: inline-block;
  width: 12px;
  height: 8px;
  background: url('~@/assets/images/default/ic_done.png') no-repeat center center;
  background-size: 100% 100%;
  margin-right: 10px;
}
.ico-set {
  display: inline-block;
  width: 12px;
  height: 12px;
  background: url('~@/assets/images/default/ic_set.png') no-repeat center center;
  background-size: 100% 100%;
}
</style>
