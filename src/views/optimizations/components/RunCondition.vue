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
    <div class="content-title">运行条件</div>
    <div class="table">
      <w-table :columns="column" :dataSource="dataList" :scroll="{ y: 270 }">
        <span slot="customName1">
          <span>排泥量</span>
          <br />
          <span>（m³/d）</span>
        </span>
        <span slot="customName2">
          <span>泥龄SRT</span>
          <br />
          <span>（d）</span>
        </span>
        <span slot="customName3">
          <span>外回流比</span>
          <br />
          <span>（%）</span>
        </span>
        <span slot="customName4">
          <span>除磷加药量</span>
          <br />
          <span>（kg/d）</span>
        </span>
        <template slot="time" slot-scope="text">
          <span>{{text ? $moment(text).format('MM/DD HH:mm') : ''}}</span>
        </template>
      </w-table>
    </div>
  </div>
</template>
<script>
import { getOperatingCondition } from '@/api/optimization';
const column = [
  {
    title: '记录时间',
    dataIndex: 'recordTime',
    align: 'center',
    width: 120,
    scopedSlots: { customRender: 'time' },
  },
  {
    slots: { title: 'customName1' },
    dataIndex: 'sludgeDischarge',
    align: 'center',
    width: 120,
  },
  {
    slots: { title: 'customName2' },
    dataIndex: 'mudAge',
    align: 'center',
    width: 120,
  },
  {
    slots: { title: 'customName3' },
    dataIndex: 'externalRefluxRatio',
    align: 'center',
    width: 120,
  },
  {
    slots: { title: 'customName4' },
    dataIndex: 'dephosphorizationPlusDosage',
    align: 'center',
    width: 120,
  },
];
export default {
  name: 'RunCondition',
  props: {
    waterPlantId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      column,
      dataList: [],
      startTime: '',
      endTime: '',
    };
  },
  watch: {
    waterPlantId() {
      let day = this.$moment().format('YYYY-MM-DD');
      this.startTime = day + ' 00:00:00';
      this.endTime = day + ' 23:59:59';
      this.getData();
    },
  },
  methods: {
    async getData() {
      let params = {
        waterPlantId: this.waterPlantId,
        endTime: this.endTime,
        startTime: this.startTime,
      };
      let res = await getOperatingCondition(params);
      let { status, resultData } = res;
      if (status === 'complete') {
        this.dataList = resultData;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.content {
  margin: 6px;
  width: calc(50% - 6px);
  background-color: var(--supply-color-bg-card-component);
  &-title {
    padding: 12px 0 10px 12px;
    font-weight: 600;
    font-size: 16px;
    color: #333333;
    letter-spacing: 0;
  }
  .table {
    padding: 0px 12px;
  }
  /deep/ .wpg-table {
    .wpg-table-thead {
      height: 60px;
      font-size: 14px;
      color: #6281a3;
      line-height: 20px;
    }
    .wpg-table-tbody {
      tr {
        height: 40px;
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
