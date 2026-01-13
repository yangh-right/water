<!-- 危险品管理组件 -->
<template>
  <!-- 使用UnitCard组件作为容器 -->
  <unit-card :cardTitle="cardTitle">
    <!-- 内容区域 -->
    <div class="card-inner">
      <!-- 表格展示数据 -->
      <w-table
        class="tableDevice"
        ref="wTable"
        :columns="columns"
        :data-source="dataList"
        :scroll="{ y: 190 }"
        :rowClassName="() => 'exam-row'"
        :customRow="customRow"
        :pagination="false"
      >
        <!-- 状态列自定义模板 -->
        <template slot="status" slot-scope="text, record">
          <span :class="['status', text ? 'online' : '']">
            <span class="status__circle"></span>{{ text ? '在线' : '离线' }}
          </span>
        </template>
      </w-table>
    </div>
  </unit-card>
</template>

<script>
// 导入API
import { hazardousChemicalsPage } from '@/api/deviceManagement.js';
import { wasteLiquidsCount, specialEquipmentCount } from '@/api/cockpit.js';

export default {
  name: 'dangerousManage',
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
      // 当前选中类型
      type: '1',
      // 数据列表
      dataList: [],
      // 表格列配置
      columns: [
        {
          title: '序号',
          dataIndex: 'index',
          width: 30
        },
        {
          title: '类型',
          dataIndex: 'type',
          width: 60
        },
        {
          title: '数量',
          dataIndex: 'count',
          width: 30
        }
      ]
    };
  },
  mounted() {
    this.initData();
  },
  methods: {
    // 初始化数据
    initData() {
      if (this.type === '1') {
        this.getHazardousList();
      } else {
        this.getEquipmentList();
      }
    },
    // 获取危险品列表
    async getHazardousList() {
      const promises = [
        hazardousChemicalsPage({ page: { current: 1, size: 10000 } }),
        wasteLiquidsCount({})
      ];
      let res = await Promise.allSettled(promises);
      this.dataList = [];
      res.forEach((item, i) => {
        if (!i) {
          let count = item?.value?.resultData?.total;
          this.dataList.push({
            index: '01',
            type: '危险药剂',
            count: count ? `${count}种` : ''
          });
        } else {
          item?.value?.resultData?.forEach((data, index) => {
            this.dataList.push({
              index: index < 8 ? `0${index + 2}` : index + 2,
              type: data.key,
              count: data.value ? `${data.value}种` : ''
            });
          });
        }
      });
    },
    /* 点击表格 */
    customRow(record, idx) {
      return {
        on: {
          click: e => {
            if (this.type === '1') {
              this.drillDown({
                path: '/hazardousChemicals'
              });
            } else {
              this.drillDown({
                path: '/specialEquipment'
              });
            }
          }
        }
      };
    },
    // 获取设备列表
    async getEquipmentList() {
      const { resultData, status } = await specialEquipmentCount({});
      if (status === 'complete') {
        this.dataList =
          resultData?.map((item, i) => {
            return {
              index: i < 9 ? `0${i + 1}` : i + 1,
              type: item.key,
              count: item.value ? `${item.value}种` : ''
            };
          }) || [];
      }
    }
  }
};
</script>

<style lang="less" scoped>
/deep/ .exam-row {
  cursor: pointer;
}
.card-inner {
  width: 100%;
  height: 100%;
}
</style>
