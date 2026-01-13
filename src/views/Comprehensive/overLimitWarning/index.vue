<template>
  <div class="plan-manage">
    <table-search class="plan-manage-list supply-bg-bg">
      <w-row slot="form" :gutter="20">
        <w-col :span="4">
          <w-form-item label="选择污水厂">
            <factory-select
              class="factory-select"
              v-model="options.waterPlantId"
              autoSelect
              @input="handleSearch"
              :showAll="showAll"
            ></factory-select>
          </w-form-item>
        </w-col>
        <w-col :span="4">
          <w-form-model-item>
            <w-radio-group v-model="options.statType" @change="handleChange">
              <w-radio :value="0">
                按污水厂
              </w-radio>
              <w-radio :value="1">
                按设备
              </w-radio>
            </w-radio-group>
          </w-form-model-item>
        </w-col>
        <w-col :span="6" v-if="options.statType == '0'">
          <w-form-model-item class="select-pumps" label="选择构筑物" prop="placeIds">
            <pump-select
              class="supply-w-full"
              show-checkbox
              :replaceFields="{ label: 'title', children: 'children' }"
              v-model="options.placeIdList"
              :tree-data="treeData"
              :max-tag-count="1"
              default-expand-all
            />
          </w-form-model-item>
        </w-col>
        <w-col :span="6" v-if="options.statType == '1'">
          <w-form-model-item class="select-pumps" label="选择设备" prop="deviceIds">
            <pump-select
              class="supply-w-full"
              show-checkbox
              :replaceFields="{ label: 'title', children: 'children' }"
              v-model="options.deviceIdList"
              :tree-data="treeDataDevice"
              :max-tag-count="1"
              default-expand-all
            />
          </w-form-model-item>
        </w-col>
        <w-col :span="6">
          <w-form-model-item label="报警时间" prop="date">
            <w-range-picker
              v-model="options.date"
              :allowClear="false"
              :disabled-date="disabledDate"
              class="supply-w-full"
            />
          </w-form-model-item>
        </w-col>
        <w-col class="supply-float-right">
          <w-button class="supply-mr-3" @click="handleReset" icon="reload">重置</w-button>
          <w-button type="primary" @click="refresh('clearQuery')" icon="search">查询</w-button>
        </w-col>
      </w-row>
      <s-table
        ref="table"
        class="supply-bg-bg-card-component inspect-table"
        :columns="columns"
        :canResize="true"
        :initLoadData="false"
        rowKey="id"
        :data="loadData"
        :rowClassName="(record, index) => (index === deletingRow ? 'deleting-row' : '')"
      >
        <template slot="flowPv" slot-scope="text, record">
          <span :style="{ color: record.flowUpLimitPv ? 'red' : '#333333' }">{{ text }}</span>
        </template>
        <template slot="powerPv" slot-scope="text, record">
          <span :style="{ color: record.powerUpLimitPv ? 'red' : '#333333' }">{{ text }}</span>
        </template>
      </s-table>
    </table-search>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { queryList, getStructureByStationId } from '@/api/deviceManagement';
import { getAlarmEnergyData } from '@/api/analysis';
import FactorySelect from '@/components/factory-select/index';
import PumpSelect from '@/components/Virtual/VirtualTreeSelect';
export default {
  name: 'overLimitWarning',
  components: {
    FactorySelect,
    PumpSelect
  },
  data() {
    return {
      showAll: true,
      options: {
        waterPlantId: '',
        statType: 0,
        deviceIdList: [],
        placeIdList: [],
        date: [this.$moment('2024-05-08').subtract(7, 'days'), this.$moment()],
        deviceId: '',
        operateType: ''
      },
      columns: [],
      treeData: [], // 构筑物
      treeDataDevice: [], // 设备
      editType: 1,
      inspectData: {},
      deletingRow: -1,
      deviceList: [], // 设备列表
      pumpList: []
    };
  },
  computed: {
    ...mapState('setting', ['buttonCodes'])
  },
  watch: {
    'options.statType': {
      handler(val) {
        let columns = [
          {
            title: '序号',
            dataIndex: 'num',
            key: 'num',
            width: 80,
            align: 'center',
            customRender: (text, row, index) => {
              return index + 1;
            }
          },
          {
            title: '污水厂名称',
            dataIndex: 'waterPlantName',
            width: 160,
            align: 'center',
            ellipsis: true
          },
          {
            title: '构筑物名称',
            dataIndex: 'placeName',
            width: 160,
            align: 'center',
            ellipsis: true
          },
          {
            title: '设备名称',
            dataIndex: 'deviceName',
            width: 160,
            align: 'center',
            ellipsis: true
          },
          {
            title: '流量(m³)',
            dataIndex: 'flowPv',
            width: 120,
            align: 'center',
            ellipsis: true,
            scopedSlots: { customRender: 'flowPv' }
          },
          {
            title: '流量上限',
            dataIndex: 'flowUpLimitPv',
            width: 120,
            align: 'center',
            ellipsis: true
          },
          {
            title: '电量(kWh)',
            dataIndex: 'powerPv',
            width: 120,
            align: 'center',
            ellipsis: true,
            scopedSlots: { customRender: 'powerPv' }
          },
          {
            title: '电量上限',
            dataIndex: 'powerUpLimitPv',
            width: 120,
            align: 'center',
            ellipsis: true
          },

          {
            title: '时间',
            dataIndex: 'dateTime',
            width: 180,
            align: 'center',
            ellipsis: true
          }
        ];
        if (val == '0') {
          columns.splice(2, 2);
          this.columns = columns;
        } else if (val == 1) {
          columns.splice(1, 2);
          this.columns = columns;
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.init();
  },
  activated() {
    this.refresh();
  },
  methods: {
    init() {
      Promise.allSettled([this.getOrgPumpTree(), this.getOrgPumpHouseDeviceTree()]).then(() => {
        this.pageSearchLoaded = true;
        this.refresh(true, false);
      });
    },
    loadData(parameter) {
      let ids = this.dealSendData();
      let placeIdList = this.options.statType == '0' ? ids : [];
      let deviceIdList = this.options.statType == '0' ? [] : ids;
      const params = {
        ...this.options,
        startDate: this.$moment(this.options.date[0]).format('YYYY-MM-DD'),
        endDate: this.$moment(this.options.date[1]).format('YYYY-MM-DD'),
        page: {
          current: parameter.pageNo,
          size: parameter.pageSize
        },
        placeIdList,
        deviceIdList,
        waterPlantIdList: [this.options.waterPlantId]
      };
      return getAlarmEnergyData(params).then(res => {
        this.pumpList = res.resultData?.records || [];
        return res.resultData;
      });
    },
    handleSearch() {
      this.init();
    },
    handleChange(e) {
      this.refresh();
    },
    refresh(bool = true) {
      // 点击查询/重置 清空路由参数
      if (bool === 'clearQuery') {
        bool = true;
        this.$router.push({});
      }
      if (this.$refs.table && !this.$refs.table.localLoading && this.pageSearchLoaded) {
        this.$refs.table.refresh(bool);
      }
    },
    handleReset() {
      this.options = {
        waterPlantId: '',
        statType: 0,
        deviceIdList: [],
        placeIdList: [],
        date: [this.$moment().subtract(7, 'days'), this.$moment()],
        deviceId: '',
        operateType: ''
      };
      this.refresh();
    },
    /** 组织构筑物树 */
    getOrgPumpTree() {
      getStructureByStationId({
        waterPlantId: this.options.waterPlantId ? this.options.waterPlantId : ''
      }).then(res => {
        let ids = [];
        this.treeData = [
          {
            value: 'allCheck',
            key: 'allCheck',
            title: '全选',
            children: this.handleData(res.resultData, ids)
          }
        ];
        this.allpIds = ids;
        this.options.placeIdList = ['allCheck', ...this.allpIds];
      });
    },
    /**
     * 组织构筑物设备树
     */
    getOrgPumpHouseDeviceTree() {
      queryList({
        waterPlantId: this.options.waterPlantId ? this.options.waterPlantId : '',
        page: {
          size: 9999,
          current: 1,
          total: 0
        }
      }).then(res => {
        let ids = [];
        this.treeDataDevice = [
          {
            value: 'allCheck',
            key: 'allCheck',
            title: '全选',
            children: this.handleDataDevice(res.resultData.records, ids)
          }
        ];
        this.allpIdsDevice = ids;
        this.options.deviceIdList = ['allCheck', ...this.allpIdsDevice];
      });
    },
    /** 处理数据 */
    handleData(data, ids = []) {
      if (data.length <= 0) return [];
      return data.map(item => {
        let { name, id } = item;
        ids.push(id + '||mark' + name);
        return {
          children: [],
          title: name,
          key: id + '||mark' + name,
          value: id + '||mark' + name
        };
      });
    },
    handleDataDevice(deviceTreeData, ids = []) {
      if (deviceTreeData.length <= 0) return [];
      return deviceTreeData.map(item => {
        let { deviceName, industryDeviceId } = item;
        ids.push(industryDeviceId + '||mark' + deviceName);
        return {
          children: [],
          title: deviceName,
          key: industryDeviceId + '||mark' + deviceName,
          value: industryDeviceId + '||mark' + deviceName
        };
      });
    },
    dealSendData() {
      let currentIds =
        this.options.statType == '0' ? this.options.placeIdList : this.options.deviceIdList;
      let ids = JSON.parse(JSON.stringify(currentIds));
      let idx = ids.findIndex(id => id === 'allCheck');
      if (idx > -1) ids.splice(idx, 1);
      return ids.map((item, i) => {
        return item.split('||mark')[0];
      });
    },
    /* 禁止选择日期 */
    disabledDate(current) {
      return current && current > this.$moment().endOf('day');
    }
  }
};
</script>

<style lang="less" scoped>
.plan-manage {
  width: 100%;
  height: 100%;
  .inspect-table /deep/ .supply-pro-table-title__toolbar {
    justify-content: space-between;
    width: 100%;
  }
  &-list {
    .wpg-calendar-picker {
      width: 100%;
    }
  }
}
</style>
