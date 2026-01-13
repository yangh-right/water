<template>
  <div class="fitting-tree">
    <w-radio-group
      v-if="deviceList.length"
      v-model="deviceId"
      button-style="solid"
      @change="onRadioChange"
    >
      <w-radio-button v-for="item in deviceList" :key="item.id" :value="item.id">
        {{ item.name }}
      </w-radio-button>
    </w-radio-group>

    <div class="fitting-table">
      <w-table
        rowKey="componentId"
        :columns="columns"
        :pagination="false"
        :dataSource="dataSource"
        :rowSelection="
          disabled || readonly
            ? null
            : { selectedRowKeys: selectedRowKeys, onChange: onSelectChange }
        "
      ></w-table>
    </div>
  </div>
</template>

<script>
import { getDeviceListByPump, getComponentListByDevice } from '@/api/pump';
import { getComponentList } from '@/api/work';

export default {
  name: 'FittingTree',

  props: {
    value: {
      type: [String, Object],
      default: ''
    },
    list: {
      type: [Object, Array],
      default: () => {}
    },
    orgId: {
      type: String,
      default: ''
    },
    pumpId: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    selectable: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      deviceId: '',
      deviceList: [],
      componentList: [],
      selectedRowKeys: [],
      dataSource: [],
      columns: [
        {
          title: '序号',
          dataIndex: 'index',
          width: 120
        },
        {
          title: '配件名称',
          dataIndex: 'componentName',
          width: 200
        },
        {
          title: '配件规格',
          dataIndex: 'componentModel'
        }
      ]
    };
  },

  watch: {
    value: {
      handler(val) {
        this.handleValue(val);
      }
    },
    list() {
      this.handleComponent(this.deviceId);
    },
    pumpId: {
      handler(val) {
        if (val) {
          this.handlePump(val);
        }
      }
    }
  },

  mounted() {
    this.init();
  },

  methods: {
    async getDeviceListByPump(pumpId) {
      let res = await getDeviceListByPump(pumpId);

      return res.resultData || [];
    },

    async getComponentListByDevice(deviceId) {
      let res = await getComponentListByDevice(deviceId);

      return res.resultData || [];
    },

    async handlePump(pumpId) {
      let deviceList = await this.getDeviceListByPump(pumpId);
      let value = this.value || {};

      if (this.readonly || this.disabled) {
        deviceList = deviceList.filter(item => value[item.id] && value[item.id].length);
      }
      this.deviceList = deviceList;
      let idx = 0;

      for (let i = 0; i < this.deviceList.length; i++) {
        let item = this.deviceList[i];
        let list = value[item.id];
        if (list && list.length) {
          idx = i;
          break;
        }
      }

      if (this.deviceList.length) {
        this.deviceId = this.deviceList[idx].id;
        await this.handleComponent(this.deviceId);
      }

      this.handleValue(this.value);
    },

    async handleComponent(deviceId) {
      let deviceItem = this.deviceList.find(v => v.id === deviceId);

      if (deviceItem) {
        if (!deviceItem.componentList) {
          let list = await this.getComponentListByDevice(deviceId);

          if (this.selectable) {
            let data = {};

            if (this.readonly) {
              data = this.value || {};
            } else {
              data = this.list || {};
            }

            let value = data[deviceId] || [];
            list = list.filter(v => value.includes(v.componentId));
          }

          let componentList = list.map((o, idx) => {
            return {
              ...o,
              index: idx + 1
            };
          });
          deviceItem.componentList = componentList;
        }
        if (!deviceItem.selectedComponentKeys) {
          deviceItem.selectedComponentKeys = [];
        }

        this.selectedRowKeys = deviceItem.selectedComponentKeys;
        let componentList = deviceItem.componentList;

        this.dataSource = componentList;
      }
    },

    async handlePreviewData() {
      if (this.value && !this.deviceList.length) {
        let ret = await getComponentList(this.value);
        let result = ret.resultData || [];

        this.deviceList = result.map(item => {
          let componentList = item.componentList || [];
          return {
            id: item.deviceId,
            name: item.deviceName,
            componentList: componentList.map((item, idx) => {
              return {
                ...item,
                index: idx + 1
              };
            })
          };
        });

        if (this.deviceList.length) {
          this.deviceId = this.deviceList[0].id;
          await this.handleComponent(this.deviceId);
        }
      }
    },

    async init() {
      if (this.readonly || this.selectable) {
        await this.handlePreviewData();
      } else if (this.pumpId) {
        await this.handlePump(this.pumpId);
        await this.handleComponent(this.deviceId);
      }
    },

    async handleValue(data) {
      if (this.readonly || this.selectable) {
        await this.handlePreviewData();
      }

      if (data) {
        // let deviceItem = this.deviceList.find(v => v.id === this.deviceId);

        this.deviceList.forEach(item => {
          item.selectedComponentKeys = data[item.id] || [];
        });

        if (data[this.deviceId]) {
          this.selectedRowKeys = data[this.deviceId];
        }

        // if (this.readonly && deviceItem) {
        //   this.handleDataSource(deviceItem.componentList);
        // }
      }
    },

    handleDataSource(componentList) {
      this.dataSource = this.selectedRowKeys.map((id, idx) => {
        let item = componentList.find(o => o.componentId === id);

        return {
          ...item,
          index: idx + 1
        };
      });
    },

    onSelectChange(selectedRowKeys) {
      let deviceItem = this.deviceList.find(v => v.id === this.deviceId);
      deviceItem.selectedComponentKeys = selectedRowKeys;

      this.selectedRowKeys = deviceItem.selectedComponentKeys;

      let value = this.deviceList.reduce((prev, curr) => {
        prev[curr.id] = curr.selectedComponentKeys;

        return prev;
      }, {});

      this.$emit('input', value);
    },

    onRadioChange() {
      this.handleComponent(this.deviceId);
    }
  }
};
</script>

<style lang="less" scoped>
.fitting-tree {
  margin-top: 6px;

  /deep/ .ant-radio-group {
    .ant-radio-button-wrapper {
      min-width: 60px;
      height: 28px;
      line-height: 26px;
      text-align: center;
    }
  }
}

.fitting-table {
  margin-top: 12px;
}
</style>
