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
    <div class="card-inner">
      <w-table
        class="tableDevice"
        ref="wTable"
        :columns="columns"
        :data-source="sortedItems"
        :scroll="{ y: 190 }"
        :pagination="false"
        rowKey="id"
      >
        <template slot="online" slot-scope="text, record">
          <span :class="['status', text ? 'online' : '']"
            ><span class="status__circle"></span>{{ text ? '在线' : '离线' }}</span
          >
        </template>
      </w-table>
    </div>
  </unit-card>
</template>

<script>
import {
  personLocationCard,
  personLocationLogin,
  personLocationSnapshot
} from '@/api/realTimePositioning';
export default {
  name: 'safetyBracelets',
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
          customRender: (text, row, index) => {
            return index + 1;
          }
        },
        {
          title: '手环名称',
          dataIndex: 'entityName'
        },
        {
          title: '手环状态',
          dataIndex: 'online',
          scopedSlots: { customRender: 'online' }
        }
      ]
    };
  },

  computed: {
    sortedItems() {
      return this.dataList.slice().sort((a, b) => {
        return a.entityName.localeCompare(b.entityName, 'zh-Hans-CN', { sensitivity: 'accent' });
      });
    }
  },
  mounted() {
    this.initData();
  },
  methods: {
    async getStation() {
      let params = {
        username: 'root',
        code: '$2a$10$bfoevE.vdhiDroQvBz3UXekkv.r/zTTmraW4xtXcSLTbvW1JvaVqS'
      };
      // 获取站点信息
      const { success, resultData } = await personLocationLogin(params);
      if (success) {
        this.tokenLogin = resultData;
      }
    },
    async initData() {
      await this.getStation();
      try {
        const { success, resultData } = await personLocationSnapshot(this.tokenLogin);
        if (success && resultData?.data) {
          // 过滤掉没有eamEntity的数据，并确保数据结构完整
          this.dataList = resultData.data.map((item, i) => ({
            ...item
          }));
        } else {
          this.dataList = [];
        }
      } catch (error) {
        console.error('获取人员定位卡数据出错:', error);
      }
    },
    // 跳转到班组管理
    goTeamManage() {
      this.drillDown({
        path: '/securityManage/personnelLocation'
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
    &__circle {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--supply-color-invalid);
      color: var(--supply-color-invalid);
      margin-right: 6px;
    }
    &.online {
      color: var(--supply-color-main);
      .status__circle {
        background-color: #00e07a;
      }
    }
  }
}
</style>
