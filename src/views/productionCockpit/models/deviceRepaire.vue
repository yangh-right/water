<!--
 * @Author: wangyr
 * @Date: 2023-09-05 10:30:42
 * @LastEditors: fengtaotao
 * @LastEditTime: 2025-03-18 09:51:21
 * @Description:
-->
<template>
  <unit-card :cardTitle="cardTitle">
    <!-- 下钻详情 -->
    <!-- <div slot="headerRight" class="workforce" @click="goTeamManage">
      <span>详情</span>
      <w-icon type="right" style="margin-left:4px;font-size: 12px;"></w-icon>
    </div> -->
    <div class="card-inner">
      <w-table
        class="tableDevice"
        ref="wTable"
        :columns="columns"
        :data-source="dataList"
        :scroll="{ y: 190 }"
        :pagination="false"
        rowKey="id"
      >
        <template slot="ticketStatus" slot-scope="text, record">
          <span>{{ text === '2' ? '已完成' : text === '1' ? '维修中' : '' }}</span>
        </template>
        <template slot="timeOutFlag" slot-scope="text, record">
          <span>{{ text === '1' ? '是' : text === '0' ? '否' : '' }}</span>
        </template>
      </w-table>
    </div>
  </unit-card>
</template>

<script>
import { getDateRange } from './data';
import { deviceRepairStatus } from '@/api/cockpit';
export default {
  name: 'deviceRepaire',
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
      tokenLogin: '', //对接登录token
      dataList: [],
      columns: [
        {
          title: '序号',
          dataIndex: 'index',
          width: 60
        },
        {
          title: '设备名称',
          dataIndex: 'deviceName'
        },
        {
          title: '故障时间',
          dataIndex: 'ticketCreateTime',
          customRender: text => {
            return text ? text.split(' ')[0] : '';
          },
          width: 120
        },
        {
          title: '状态',
          dataIndex: 'ticketStatus',
          scopedSlots: { customRender: 'ticketStatus' }
        },
        {
          title: '是否超时',
          dataIndex: 'timeOutFlag',
          scopedSlots: { customRender: 'timeOutFlag' }
        }
      ]
    };
  },

  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.initData();
        }
      },
      immediate: true
    }
  },
  methods: {
    async initData() {
      let { startDate, endDate } = getDateRange('month');
      const params = {
        queryType: 'month',
        endDate,
        startDate,
        waterPlantId: this.waterPlantId
      };
      let { resultData, status } = await deviceRepairStatus(params);
      if (status === 'complete') {
        this.dataList = resultData || [];
        this.dataList.forEach((item, index) => {
          item.index = index + 1;
        });
      }
    },
    // 跳转到工单
    goTeamManage() {
      this.drillDown({
        path: '/manage/RepaireList'
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
.card-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .status {
    &.online {
      color: #f64357;
    }
  }
}
</style>
