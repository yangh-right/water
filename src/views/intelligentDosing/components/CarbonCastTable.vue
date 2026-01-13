<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: fengtaotao
 * @LastEditTime: 2023-05-30 13:57:06
-->
<template>
  <div class="content">
    <div class="content-title">
      <div class="title">{{ title }}</div>
      <div v-if="switchBtns.length" class="switch-btns">
        <div
          v-for="(item, index) in switchBtns"
          :key="item.value + index"
          :class="currentTab === item.value ? 'btn active' : 'btn'"
          @click="changeBtn(item)"
        >
          {{ item.name }}
        </div>
      </div>
    </div>
    <div class="content-middle">
      <div class="item">
        <div class="title">实际投加量日统计值</div>
        <div>
          <span class="value">{{ totalCarbon }}</span>
          <span class="unit">m³/d</span>
        </div>
      </div>
      <a-divider type="vertical" class="split" />
      <div class="item">
        <div class="title">计算流量日统计值</div>
        <div>
          <span class="value">{{ totalFlow }}</span>
          <span class="unit">m³/d</span>
        </div>
      </div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="table">
        <w-table :columns="column" :dataSource="dataList" :scroll="{ y: 170 }"></w-table>
      </div>
    </w-spin>
  </div>
</template>
<script>
import { carbonSourceAddedList } from '@/api/analysis';
const column = [
  {
    title: '时间',
    dataIndex: 'dateTime',
    align: 'center',
    width: 100,
    scopedSlots: { customRender: 'dateTime' }
  },
  {
    title: '药剂类型',
    dataIndex: 'medicamentType',
    align: 'center',
    width: 100
  },
  {
    title: '实际投加量(L/h)',
    dataIndex: 'realPv',
    align: 'center',
    width: 140
  },
  {
    title: '计算流量(L/h)',
    dataIndex: 'simulatePv',
    align: 'center',
    width: 140
  }
];
export default {
  name: 'CarbonCastTable',
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    },
    switchBtns: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getData();
        }
      },
      immediate: true
    }
  },
  data() {
    return {
      currentTab: 'A',
      column,
      loading: false,
      totalFlow: '',
      totalCarbon: '',
      dataList: []
    };
  },
  methods: {
    changeBtn(data) {
      this.currentTab = data.value;
      this.getData();
    },
    async getData() {
      this.loading = true;
      let res = await carbonSourceAddedList(this.waterPlantId);
      let { status, resultData, errorMessage } = res;
      this.loading = false;
      this.dataList = [];
      this.totalCarbon = '';
      this.totalFlow = '';
      if (status === 'complete') {
        resultData.forEach(item => {
          if (item.line === this.currentTab) {
            this.dataList = item.subCarbonSourceAddedList;
            this.totalCarbon = item.totalCarbon;
            this.totalFlow = item.totalFlow;
          }
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  height: 312px;
  background-color: var(--supply-color-bg-card-component);
  &-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 12px;
    height: 50px;
    .title {
      font-weight: 600;
      font-size: 16px;
      letter-spacing: 0;
    }
  }
  .switch-btns {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .btn {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 64px;
      height: 32px;
      cursor: pointer;
      color: #333333;
      font-weight: 400;
      font-size: 14px;
      border: 1px solid #d6d6d6;
      border-radius: 4px 0 0 4px;
    }
    .btn:last-child {
      border-radius: 0px 4px 4px 0px;
    }
    .active {
      border: 1px solid #4285f4;
      color: #4285f4;
    }
  }
  &-middle {
    margin: 12px 0px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .split {
      height: 20px;
    }
    .item {
      padding: 0 20px;
      width: 50%;
      display: flex;
      //  justify-content: space-between;
      align-items: center;
      font-weight: 500;
      font-size: 16px;
      color: #666666;

      .value {
        margin-left: 80px;
        margin-right: 4px;
        font-weight: 600;
        font-size: 16px;
        color: #333333;
      }
    }
  }
  .spin {
    height: calc(100% - 90px);
  }
  .table {
    padding: 0px 12px;
  }
  /deep/ .wpg-table {
    .wpg-table-thead {
      height: 36px;
      font-size: 14px;
      color: #6281a3;
      line-height: 20px;
    }
    .wpg-table-tbody {
      tr {
        height: 36px;
        font-size: 14px;
        line-height: 20px;
        color: #333333;
      }
    }
  }
  /deep/ .wpg-table-pagination {
    display: none;
  }
}
</style>
