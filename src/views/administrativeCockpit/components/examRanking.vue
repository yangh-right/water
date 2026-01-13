<!--
 * @Author: wangyr
 * @Date: 2023-06-15 10:59:17
 * @LastEditors: wangyr
 * @LastEditTime: 2024-11-18 14:26:21
 * @Description:
-->
<template>
  <div class="exam-rank">
    <w-table
      class="tableDevice"
      ref="wTable"
      :columns="columns"
      :data-source="dataList"
      :scroll="{ y: 190 }"
      :pagination="false"
      :rowClassName="() => 'exam-row'"
      :customRow="customRow"
      rowKey="id"
    >
      <template slot="index" slot-scope="text">
        <img
          v-if="text <= 3"
          :src="$require(`@/assets/administrativeCockpit/rank${text}.png`)"
          alt=""
        />
        <div v-else class="text">
          <div>{{ text }}</div>
        </div>
      </template>
    </w-table>
  </div>
</template>
<script>
import { assetsRequire } from '@/core/mixins';
import { userRank } from '@/api/cockpit';
export default {
  name: 'AdministrativeCockpit',
  components: {},
  props: {
    currentTestId: {
      default: '',
      type: String
    }
  },
  mixins: [assetsRequire],
  data() {
    return {
      dataList: [],
      columns: [
        {
          title: '名次',
          key: 'index',
          dataIndex: 'index',
          width: '90',
          scopedSlots: { customRender: 'index' }
        },
        {
          title: '姓名',
          key: 'userName',
          dataIndex: 'userName',
          width: '90'
        },
        {
          title: '分数',
          key: 'score',
          dataIndex: 'score',
          width: '90'
        }
      ]
    };
  },
  computed: {},
  watch: {
    currentTestId: {
      handler(val) {
        if (val) {
          this.getData();
        }
      },
      immediate: true
    }
  },
  activated() {},
  created() {},
  methods: {
    async getData() {
      let { resultData, status } = await userRank(this.currentTestId);
      if (status === 'complete') {
        this.dataList = resultData.map((item, index) => {
          return {
            ...item,
            index: index + 1
          };
        });
      }
    },
    /* 点击表格 */
    customRow(record, idx) {
      return {
        on: {
          click: e => {
            this.drillDown({
              path: '/examineeAnalysis'
            });
          }
        }
      };
    }
  }
};
</script>
<style lang="less" scoped>
.exam-rank {
  width: 100%;
  height: calc(100% - 28px);
  img {
    width: 25px;
    height: 25px;
  }
  .text {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 20px;
    height: 20px;
    border-radius: 20px;
    background: #cce7e7;
    div {
      font-family: MiSans-Semibold, sans-serif;
      font-weight: 600;
      font-size: 13px;
      color: #008583;
      letter-spacing: 0;
      text-align: center;
    }
  }
  /deep/ .exam-row {
    cursor: pointer;
  }
  /deep/ .wpg-table-tbody > tr > td {
    padding: 6px 16px !important;
  }
}
</style>
