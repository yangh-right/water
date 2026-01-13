<!--
 * @Author: wangyr
 * @Date: 2023-06-15 10:59:17
 * @LastEditors: wangyr
 * @LastEditTime: 2024-11-18 14:26:21
 * @Description:
-->
<template>
  <div class="work-force">
    <w-table
      class="tableDevice"
      ref="wTable"
      :columns="columns"
      bordered
      :data-source="tableData"
      :scroll="{ y: 200 }"
      :pagination="false"
      rowKey="id"
    >
    </w-table>
  </div>
</template>
<script>
import { assetsRequire } from '@/core/mixins';

import { queryOaScheduleCalendar } from '@/api/cockpit';
export default {
  name: 'AdministrativeCockpit',
  components: {},
  mixins: [assetsRequire],
  data() {
    return {
      waterPlantId: '',
      dataList: [],
      factoryList: [],
      tableData: [],
      columns: [
        {
          title: '日期',
          key: 'dateTime',
          dataIndex: 'dateTime',
          width: 60,
          customRender: (value, row, index) => {
            const obj = {
              children: value,
              attrs: {
                //  rowSpan:3
              }
            };
            obj.attrs.rowSpan = row.dateTimeRowSpan;
            return obj;
          }
        },
        {
          title: '班次',
          key: 'rank',
          dataIndex: 'rank',
          width: 60
        },
        {
          title: '值班人员',
          key: 'user',
          dataIndex: 'user',
          width: 120
        }
      ]
    };
  },
  computed: {},
  activated() {},
  created() {
    this.getFactoryList();
  },
  methods: {
    async getFactoryList() {
      if (this.$store.state.factoryList.length > 0) {
        this.factoryList = this.$store.state.factoryList;
      } else {
        const { resultData } = await this.$http.post('waterPlantClient/getWaterPlants');
        this.$store.commit('setFactory', resultData);
        this.factoryList = resultData;
      }
      this.waterPlantId = this.factoryList[0].waterPlantId;
      this.getData();
    },
    generateRowSpans(data, key) {
      const spans = [];
      let currentValue = null;
      let count = 0;
      let startIndex = 0;

      // 遍历数据，计算相同值的跨度
      data.forEach((item, index) => {
        if (currentValue !== item[key]) {
          currentValue = item[key];
          startIndex = index;
          count = 1;
          // 向后查找相同值
          for (let i = index + 1; i < data.length; i++) {
            if (data[i][key] === currentValue) count++;
            else break;
          }
          // 设置起始位置的rowSpan
          spans[startIndex] = count;
        } else {
          // 非起始位置设为0
          spans[index] = 0;
        }
      });

      // 将跨度信息合并到数据中
      return data.map((item, index) => ({
        ...item,
        [`${key}RowSpan`]: spans[index] || 0
      }));
    },
    async getData() {
      this.dataList = [];
      let { resultData, status } = await queryOaScheduleCalendar({
        startTime: this.$moment().format('YYYY-MM-DD 00:00:00'),
        waterPlantId: this.waterPlantId || '',
        endTime: this.$moment()
          .add(1, 'days')
          .format('YYYY-MM-DD 23:59:59')
      });
      if (status === 'complete') {
        resultData.forEach(item => {
          let len = item.classVals.length;
          item.classVals.forEach(v => {
            let obj = {};
            obj.dateTime = item.scheduleDate;
            obj.rank = v.clssVal.className;
            obj.user = '';
            v.classGroupAndUserVOList.forEach(m => {
              obj.user += m.userName + ' ';
            });
            obj.len = len;
            this.dataList.push(obj);
          });
        });
        this.tableData = this.generateRowSpans(this.dataList, 'dateTime');
      }
    }
  }
};
</script>
<style lang="less" scoped>
.work-force {
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
  /deep/ .wpg-table-tbody > tr > td {
    padding: 6px 16px !important;
  }
}
</style>
