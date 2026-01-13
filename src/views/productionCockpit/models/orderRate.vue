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
    <div slot="headerRight" class="workforce" @click="goTeamManage">
      <span>详情</span>
      <w-icon type="right" style="margin-left:4px;font-size: 12px;"></w-icon>
    </div>
    <div :class="['list', themeConfig.className]" v-if="dataList.length">
      <div class="list__item" v-for="(item, index) in dataList" :key="item.pointName">
        <div class="name">{{ item.name }}</div>
        <div class="chart">
          <w-progress
            :stroke-color="{
              '0%': '#00C07C',
              '100%': '#00C07C'
            }"
            type="circle"
            :percent="item.percent"
            :width="98"
          >
            <template #format="percent">
              <div class="percent-content">
                <div class="percent">{{ percent }}<span class="unit">%</span></div>
                <div class="title">{{ item.name }}</div>
              </div>
            </template>
          </w-progress>
        </div>
      </div>
    </div>
    <empty v-else></empty>
  </unit-card>
</template>

<script>
const icons = ['ic_dash', 'ic_electric_wire', 'ic_settings'];
import { computePrecent } from '@/utils/util';
import { themeMixin } from '@/core/mixins.ts';
import { workOrderAnalysis } from '@/api/cockpit.js';
export default {
  name: 'orderRate',
  mixins: [themeMixin],
  components: {
    empty: () => import('../components/empty.vue'),
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
      total: 0,
      themeConfigMap: {
        default: {
          className: 'card-default'
        },
        dark: {
          className: 'card-dark'
        }
      },
      dataList: [
        {
          percent: 0,
          name: '接单及时率'
        },
        {
          percent: 0,
          name: '处理及时率'
        },
        {
          percent: 0,
          name: '工单完成率'
        }
      ],
      goods: [
        { label: '日', value: 'day' },
        { label: '月', value: 'month' }
      ],
      type: 'day'
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
      try {
        let params = {
          startDate: this.$moment()
            .subtract(1, 'month')
            .format('YYYY-MM-DD'),
          endDate: this.$moment().format('YYYY-MM-DD')
        };
        const res = await workOrderAnalysis(params);
        if (res.status === 'complete') {
          this.dataList = [
            {
              key: 'ticket_accept',
              name: '接单及时率',
              titleDone: '及时接单',
              titleAll: '总接单',
              des: '在接单时限内接单的工单比例',
              progressw: 7,
              num: res.resultData.acceptTimelyCount,
              all: res.resultData.acceptCount,
              percent: computePrecent(res.resultData.acceptTimelyCount, res.resultData.acceptCount)
            },
            {
              key: 'ticket_deal',
              name: '处理及时率',
              titleDone: '及时处理',
              titleAll: '总处理',
              des: '在处理时限内处理的工单比例',
              progressw: 7,
              num: res.resultData.disposeTimelyCount,
              all: res.resultData.disposeCount,
              percent: computePrecent(
                res.resultData.disposeTimelyCount,
                res.resultData.disposeCount
              )
            },
            {
              key: 'ticket_arrive',
              name: '工单完成率',
              titleDone: '已完结',
              titleAll: '工单总数',
              des: '已完成工单占全部工单（不含已废止工单）的比例',
              progressw: 7,
              num: res.resultData.doneCount,
              all: res.resultData.total,
              percent: computePrecent(res.resultData.doneCount, res.resultData.total)
            }
          ];
        }
      } catch (error) {
        console.error('数据获取失败:', error);
      }
    },
    typeChange() {
      this.initData();
    },
    // 跳转到工单
    goTeamManage() {
      this.drillDown({
        path: '/manage/all'
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
.list {
  width: 100%;
  height: calc(100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  &.card-dark {
    .list__item {
      background: url('~@/assets/productionCockpit/green-bg_dark.png') no-repeat;
      background-size: 100% 100%;
    }
  }
  &__item {
    width: calc(33.33% - 8px);
    height: 100%;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0px 10px 0;
    background: url('~@/assets/productionCockpit/green-bg.png') no-repeat;
    background-size: 100% 100%;
    .name {
      height: 40px;
      width: 100%;
      text-align: center;
      line-height: 40px;
      font-weight: 600;
      font-size: 14px;
      color: var(--supply-color-bg-card-DEFAULT);
      letter-spacing: 0;
      margin-bottom: 53px;
    }
    .chart {
      .percent-content {
        display: flex;
        flex-direction: column;
        .percent {
          color: var(--supply-color-main);
          font-size: 24px;
          font-weight: 600;
          letter-spacing: 0;
          .unit {
            color: var(--supply-color-third);
            font-size: 12px;
            font-weight: 400;
            margin-left: 1px;
          }
        }
        .title {
          font-size: 14px;
          color: var(--supply-color-secondary);
          letter-spacing: 0;
        }
      }
    }
    .split {
      margin: 16px 0;
    }
    .rate {
      font-weight: 400;
      font-size: 14px;
      color: var(--supply-color-main);
      letter-spacing: 0;
    }
  }
}
</style>
