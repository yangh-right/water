<!--
 * @Author: wangyr
 * @Date: 2023-04-21 17:20:07
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-08-02 13:49:47
 * @Description:
-->
<template>
  <div class="card-box">
    <!-- 卡片标题 -->
    <div class="card-title">
      仪表维护
    </div>
    <!-- 表格区域，支持自动滚动 -->
    <div v-on:mouseout="scrollFun" v-on:mouseover="pauseScroll" class="table-container">
      <w-config-provider>
        <w-table
          class="tableDevice"
          ref="wTable"
          :columns="columns"
          :data-source="data"
          :scroll="{ y: 190 }"
          :pagination="false"
          rowKey="id"
        >
          <!-- 自定义状态列显示 -->
          <div :class="[record.statusClass, 'btn-status']" slot="status" slot-scope="text, record">
            {{ record.statusLabel }}
          </div>
          <!-- 自定义位置名称显示 -->
          <template slot="placeName" slot-scope="text, record">
            <span>{{ record.deviceStatus === -1 || !text ? '--' : text.split('-')[0] }}</span>
          </template>
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
import { queryDeviceInfo } from '@/api/cockpit.js';
import { deviceColumns } from '../models/data';
export default {
  name: 'DeviceMaintain',
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
      isLoading: false,
      columns: deviceColumns,
      data: [],
      btnsCode: {
        '1': ''
      },
      scrollTimer: null,
      scrollDirection: 'down'
    };
  },
  computed: {},
  watch: {
    factoryId: {
      handler(val) {
        this.initData(val);
      }
    }
  },
  methods: {
    async initData(id) {
      this.isLoading = true;
      let { status, resultData } = await queryDeviceInfo(id);
      if (status === 'complete') {
        // 处理数据展示
        resultData.records.forEach(item => {
          this.handleDeviceStatus(item);
        });
        this.data = resultData.records;
        // 表格内容滚动
        setTimeout(() => {
          this.scrollFun();
        }, 1000);
      }
      this.isLoading = false;
    },
    handleDeviceStatus(record) {
      let statusLabel = '';
      let statusClass = '';
      switch (record.deviceStatus) {
        case -1:
          statusLabel = '报废';
          statusClass = 'btn-status1';
          break;
        case 0:
          statusLabel = '待报废';
          statusClass = 'btn-status2';
          break;
        case 1:
          statusLabel = '正常';
          statusClass = 'btn-status3';
          break;
        case 2:
          statusLabel = '待修理';
          statusClass = 'btn-status4';
          break;
        case 3:
          statusLabel = '限制';
          statusClass = 'btn-status5';
          break;
        default:
          statusLabel = '正常';
          statusClass = 'btn-status3';
          break;
      }

      record['statusLabel'] = statusLabel;
      record['statusClass'] = statusClass;
    },
    // 自动滚动
    scrollFun() {
      if (this.data.length <= 5) {
        return false;
      }
      // 如果定时器存在
      if (this.scrollTimer) {
        // 则先清除
        clearInterval(this.scrollTimer);
        this.scrollTimer = null;
      }
      this.scrollTimer = setInterval(() => {
        const scrollHeight = document.querySelectorAll(`.tableDevice .wpg-table-body`)[0]
          .scrollHeight;
        const clientHeight = document.querySelectorAll(`.tableDevice .wpg-table-body`)[0]
          .clientHeight;
        if (clientHeight === 0) {
          return false;
        }
        const scroll = scrollHeight - clientHeight;
        const scrollTop = document.querySelectorAll(`.tableDevice .wpg-table-body`)[0].scrollTop;
        // 向下滚动
        if (this.scrollDirection === 'down') {
          // 滚动速度
          const temp = scrollTop + 2;
          document.querySelectorAll(`.tableDevice .wpg-table-body`)[0].scrollTop = temp; // 滚动
          // 距离顶部高度  大于等于 滚动长度
          if (scroll <= temp) {
            clearInterval(this.scrollTimer);
            this.scrollTimer = null;
            document.querySelectorAll(`.tableDevice .wpg-table-body`)[0].scrollTop = 0;
            this.initData(this.factoryId);
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
  activated() {
    this.scrollFun();
  },
  deactivated() {
    if (this.scrollTimer) {
      clearInterval(this.scrollTimer);
      this.scrollTimer = null;
    }
  },
  beforeDestroy() {
    if (this.scrollTimer) {
      clearInterval(this.scrollTimer);
      this.scrollTimer = null;
    }
  }
};
</script>

<style lang="less" scoped>
.chart-spin {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);
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
.btn-status1 {
  background: #f6435740;
  color: #f64357;
}
.btn-status2 {
  background: #ff922b1a;
  color: #ff922b;
}
.btn-status3 {
  background: #4285f41a;
  color: #4285f4;
}
.btn-status4 {
  background: #f6bd161f;
  color: #f6bd16;
}
.btn-status5 {
  background: #20c9971a;
  color: #20c997;
}
.ico-ding {
  display: inline-block;
  width: 16px;
  height: 16px;
  background: url('~@/assets/images/default/ic_ding.png') no-repeat center center;
  background-size: 100% 100%;
}
</style>
