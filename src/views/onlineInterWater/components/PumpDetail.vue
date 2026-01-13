<!--
 * @Author: wangyr
 * @Date: 2023-04-21 17:20:07
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-08-10 08:46:03
 * @Description:
-->
<template>
  <div class="card-box">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
    </div>
    <div class="table-container">
      <w-config-provider>
        <w-table
          class="tableDevice"
          ref="dTable"
          :columns="columns"
          :data-source="data"
          :scroll="{ y: 145 }"
          :pagination="false"
          rowKey="deviceId"
        >
          <div :class="[record.statusClass, 'btn-status']" slot="status" slot-scope="text, record">
            {{ record.statusLabel }}
          </div>
          <template slot="placeName" slot-scope="text, record">
            <span>{{ record.deviceStatus === -1 || !text ? '--' : text.split('-')[0] }}</span>
          </template>
        </w-table>
        <template #renderEmpty>
          <w-empty id="ssmal" style="margin:auto" size="small"></w-empty
        ></template>
      </w-config-provider>
    </div>
    <w-spin :spinning="isLoading" class="chart-spin"></w-spin>
  </div>
</template>

<script>
import { queryUpperDeviceRealData, getUpperDevicePointList } from '@/api/optimization';

export default {
  name: 'DeviceMaintain',
  components: {},
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      required: true,
      default: ''
    }
  },
  data() {
    return {
      isLoading: false,
      dataTimer: null,
      columns: [],
      data: []
    };
  },
  computed: {},
  watch: {
    waterPlantId: {
      handler(val) {
        this.dataTimer = null;
        this.initData(val);
        // 1分钟刷新下数据
        this.dataTimer = setInterval(() => {
          this.initData(val);
        }, 60000);
      }
    }
  },
  methods: {
    async initColumn() {
      let { status, resultData } = await getUpperDevicePointList();
      if (status === 'complete' && Array.isArray(resultData)) {
        let deviceColumns = [
          {
            title: '泵站',
            width: 100,
            align: 'center',
            dataIndex: 'deviceName',
            customRender: (text, row) => {
              return !!text ? text : '--';
            }
          },
          ...resultData.map(item => {
            return {
              title: `${item.pointMemo}(${item.pointUnit})`,
              width: 120,
              align: 'center',
              ellipsis: true,
              dataIndex: item.pointName,
              customRender: (text, row) => {
                return !!text ? text : '--';
              }
            };
          }),
          {
            title: '时间',
            width: 140,
            align: 'center',
            ellipsis: false,
            dataIndex: 'timestamp',
            customRender: (text, row) => {
              return !!text ? text : '--';
            }
          }
        ];
        this.columns = deviceColumns;
      }
    },
    async initData(id) {
      this.isLoading = true;
      let { status, resultData } = await queryUpperDeviceRealData(id);
      this.isLoading = false;
      if (status === 'complete') {
        let tempArr = [];
        resultData.forEach(item => {
          let tempObj = {};
          tempObj['deviceId'] = item.deviceId;
          tempObj['deviceName'] = item.deviceName;
          item.pointList.forEach(point => {
            tempObj[point.pointName] = point.pointValue;
            tempObj['timestamp'] = point.timestamp;
          });
          tempArr.push(tempObj);
        });
        this.data = tempArr;
      } else {
        this.data = [];
      }
    }
  },
  created() {
    this.initColumn();
  },
  mounted() {},
  beforeDestroy() {
    if (this.dataTimer) {
      clearInterval(this.dataTimer);
    }
  }
};
</script>

<style lang="less" scoped>
.card-box {
  width: calc(50% - 6px);
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;
  position: relative;

  .content-header {
    width: 100%;
    padding: 15px 12px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
  }
  .content-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }
  .table-container {
    padding: 0 12px;
    box-sizing: border-box;
  }
  .chart-spin {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 10;
    transform: translate(-50%, -50%);
  }
}
</style>
