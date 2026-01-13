<template>
  <div class="ticket-tree">
    <div
      v-if="readonly || selectable"
      class="ticket-tree-table"
      :class="{ 'ticket-tree-dialog': readonly && scrollX }"
    >
      <div v-if="readonly && scrollX">
        <a @click="showPump">{{
          dataSource.length > 1 ? '查看' : dataSource[0] ? dataSource[0].title : ''
        }}</a>
      </div>
      <w-table
        v-else
        :columns="columns"
        :scroll="scroll"
        :rowKey="rowKey"
        :pagination="dataSource.length > 10 ? true : false"
        :dataSource="dataSource"
        :rowSelection="
          selectable && !readonly
            ? { selectedRowKeys: selectedRowKeys, onChange: onSelectChange }
            : null
        "
      ></w-table>
    </div>
    <div
      v-if="!readonly && !selectable"
      class="ticket-tree-select"
      :class="{ 'ticket-tree-select-row': direction === 'row' }"
    >
      <w-radio-group
        v-model="options.treeCode"
        :disabled="disabled"
        button-style="solid"
        @change="onRadioChange"
      >
        <w-radio-button value="1">
          区域
        </w-radio-button>
        <w-radio-button value="2">
          组织
        </w-radio-button>
      </w-radio-group>

      <div class="supply-border-border-split ticket-tree-content">
        <w-tree-select
          v-if="options.treeCode === '1'"
          :value="areaCheckedKeys"
          :disabled="disabled"
          :maxTagCount="10"
          :getPopupContainer="triggerNode => triggerNode.parentNode"
          show-search
          :tree-checkable="multiple"
          :multiple="multiple"
          allow-clear
          style="width: 100%;"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          :tree-data="areaTreeData"
          :filterTreeNode="false"
          :placeholder="placeholder"
          @change="handleChange"
          @search="handleSearch"
        />
        <w-tree-select
          v-if="options.treeCode === '2'"
          :value="orgCheckedKeys"
          :disabled="disabled"
          :maxTagCount="10"
          :getPopupContainer="triggerNode => triggerNode.parentNode"
          show-search
          :tree-checkable="multiple"
          :multiple="multiple"
          allow-clear
          style="width: 100%;"
          :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
          :tree-data="orgTreeData"
          :filterTreeNode="false"
          :placeholder="placeholder"
          @change="handleChange"
          @search="handleSearch"
        />
      </div>
    </div>

    <pump-dialog ref="pumpDialog" :pumpData="{ value: value }" />
  </div>
</template>

<script>
/* eslint-disable no-param-reassign */
import PumpDialog from '@/components/common/PumpDialog.vue';
import { getTreeData } from '@/api/baseInfo';
import { getPumpList, getTankList, getDeviceInfo } from '@/api/work';

function generateTreeData(list, multiple, groups) {
  let treeData = [];

  list.forEach(item => {
    let bool = groups.find(v => v.id === item.id);
    if (!bool) {
      let data = {
        ...item,
        selectable: multiple ? true : !(item.children && item.children.length),
        key: item.id,
        id: item.id,
        value: item.id,
        title: item.name,
        queryKey: item.name + item.id,
        children: item.children ? generateTreeData(item.children, multiple, groups) : null
      };

      groups.push(data);
      treeData.push(data);
    }
  });

  return treeData;
}

export default {
  name: 'TicketTree',

  components: {
    PumpDialog
  },

  props: {
    value: {
      type: [String, Array],
      default: () => []
    },
    list: {
      type: [Array],
      default: () => []
    },
    direction: {
      type: String,
      default: 'column'
    },
    orgId: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请输入关键字'
    },
    readonly: {
      type: Boolean,
      default: false
    },
    selectable: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: true
    },
    rowKey: {
      type: String,
      default: 'index'
    },
    columns: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      options: {
        orgId: this.orgId,
        treeCode: '1',
        treeType: this.type
      },
      selectedRowKeys: [],
      areaCheckedKeys: [],
      orgCheckedKeys: [],
      checkedKeys: [],
      areaTreeNodes: [],
      orgTreeNodes: [],
      treeData: [],
      areaTreeData: [],
      orgTreeData: [],
      dataSource: [],
      filterText: '',
      scroll: { x: false },
      scrollX: false
    };
  },

  watch: {
    value(data) {
      this.formatData(data);
    },
    orgId(val) {
      this.handleOrgChange();
    },
    list() {
      this.formatData(this.value);
    },
    filterText(val) {
      if (val) {
        if (this.options.treeCode === '1') {
          this.areaTreeData = this._dealitemfilter();
        } else if (this.options.treeCode === '2') {
          this.orgTreeData = this._dealitemfilter();
        }
      } else {
        this.areaTreeData = JSON.parse(sessionStorage.getItem('areaTreeData'));
        this.orgTreeData = JSON.parse(sessionStorage.getItem('orgTreeData'));
      }
    }
  },

  mounted() {
    let data = this.value;

    let width = this.$el.offsetWidth;

    if (width < 500) {
      this.scroll = {
        x: 500
      };
      this.scrollX = true;
    }

    this.handleValue(data);

    if (this.readonly || this.selectable) {
      this.handleDataSource().then(list => {
        this.handlePreview(list);
      });
    } else {
      this.handleTreeData().then(list => {
        if (this.value && this.value.length) {
          this.onSelectChange(this.value);
        }
      });
    }
  },

  methods: {
    async getTreeData(treeCode, treeNodes) {
      let res = await getTreeData(this.options);
      let list = res.resultData || [];

      let treeData = generateTreeData(list, this.multiple, treeNodes);

      return treeData;
    },

    async handleTreeData() {
      if (this.options.treeCode === '1' && !this.areaTreeData.length) {
        this.areaTreeNodes = [];
        this.areaTreeData = await this.getTreeData(this.options.treeCode, this.areaTreeNodes);
        sessionStorage.setItem('areaTreeData', JSON.stringify(this.areaTreeData));
      }

      if (this.options.treeCode === '2' && !this.orgTreeData.length) {
        this.orgTreeNodes = [];
        this.orgTreeData = await this.getTreeData(this.options.treeCode, this.orgTreeNodes);
        sessionStorage.setItem('orgTreeData', JSON.stringify(this.orgTreeData));
      }

      return this.options.treeCode === '1' ? this.areaTreeNodes : this.orgTreeNodes;
    },

    async handleDataSource() {
      let value = this.handlePreviewValue();
      let list = [];
      if (!value.length) return [];

      if (this.type === 'device') {
        let data = Array.isArray(value) ? value[0] : value;
        let ret = await getDeviceInfo(data);
        let result = ret.resultData;

        list = [result];
        list = list.map(item => {
          return {
            ...item,
            id: item.deviceId,
            title: item.deviceName,
            address: item.pumpAddress
          };
        });
      }

      if (this.type === 'tank') {
        let ret = await getTankList(value);
        list = ret.resultData || [];
        list = list.map(item => {
          return {
            ...item,
            id: item.tankId,
            title: item.tankName,
            address: item.pumpAddress
          };
        });
      }

      if (this.type === 'pump') {
        let ret = await getPumpList(value);
        list = ret.resultData || [];
        list = list.map(item => {
          return {
            ...item,
            id: item.pumpId,
            title: item.pumpName,
            address: item.pumpAddress
          };
        });
      }

      return list;
    },

    showPump() {
      this.$refs.pumpDialog && (this.$refs.pumpDialog.visible = true);
    },

    formatData(value) {
      this.handleValue(value);

      if (this.readonly || this.selectable) {
        this.handleDataSource().then(list => {
          this.handlePreview(list);
        });
      }
    },

    handlePreviewValue() {
      let value;

      if (this.selectable && !this.readonly) {
        value = [...this.list];
      } else {
        if (this.options.treeCode === '1') {
          value = this.areaCheckedKeys;
        }
        if (this.options.treeCode === '2') {
          value = this.orgCheckedKeys;
        }
      }

      if (!Array.isArray(value)) {
        value = value ? [value] : [];
      }

      return value;
    },

    handlePreview(list) {
      if (this.readonly || this.selectable) {
        let value = this.handlePreviewValue();

        let dataSource = value.map((id, idx) => {
          let item = list.find(o => o.id === id);

          return {
            ...item,
            index: idx + 1
          };
        });

        this.dataSource = dataSource;
      }
    },

    handleValue(value) {
      // 可选择并且非展示
      if (this.selectable && !this.readonly) {
        this.selectedRowKeys = value;
      } else {
        if (this.options.treeCode === '1') {
          this.areaCheckedKeys = value;
        }
        if (this.options.treeCode === '2') {
          this.orgCheckedKeys = value;
        }
      }
    },

    handleOrgChange() {
      this.options.orgId = this.orgId;
      this.areaTreeData = [];
      this.orgTreeData = [];
      sessionStorage.removeItem('areaTreeData');
      sessionStorage.removeItem('orgTreeData');

      this.handleTreeData();
    },

    handleExt(data) {
      let value = data;
      if (!Array.isArray(value)) {
        value = value ? [value] : [];
      }

      let list = this.options.treeCode === '1' ? this.areaTreeNodes : this.orgTreeNodes;

      let dataSource = value.map((id, idx) => {
        let item = list.find(o => o.id === id);

        return {
          ...item
        };
      });

      return dataSource;
    },

    handleSearch(value) {
      this.filterText = value;
    },

    /* 按照条件过滤树数据 */
    _dealitemfilter(_data, _parentNameFilter = false) {
      let arr = _data || (this.options.treeCode === '1' ? this.areaTreeData : this.orgTreeData);
      let itemArr = [];
      let key = this.filterText || '-1truepass';

      arr.forEach((item, i) => {
        if (item.children) {
          if (item.queryKey.toUpperCase().indexOf(key.toUpperCase()) != -1 || _parentNameFilter) {
            _parentNameFilter = true;
          }
          arr[i].children = this._dealitemfilter(item.children, _parentNameFilter);
          _parentNameFilter = false;
          if (arr[i].children.length > 0) {
            itemArr.push(item);
          }
        } else {
          let flag =
            item.queryKey.toUpperCase().indexOf(key.toUpperCase()) != -1 ||
            key == '-1truepass' ||
            _parentNameFilter;
          if (flag) {
            itemArr.push(item);
          }
        }
      });

      return itemArr;
    },

    handleChange(value, node, extra) {
      let dataSource = this.handleExt(value);
      this.handleValue(value);

      this.$emit('change', value, {
        code: this.options.treeCode,
        data: dataSource
      });
    },

    onSelectChange(selectedRowKeys) {
      let dataSource = this.handleExt(selectedRowKeys);
      this.selectedRowKeys = selectedRowKeys;

      this.$emit('change', selectedRowKeys, {
        code: this.options.treeCode,
        data: dataSource
      });
    },

    onRadioChange() {
      // this.checkedKeys = [];
      if (this.options.treeCode === '1') {
        this.handleValue(this.multiple ? [...this.orgCheckedKeys] : this.orgCheckedKeys);
      }
      if (this.options.treeCode === '2') {
        this.handleValue(this.multiple ? [...this.areaCheckedKeys] : this.areaCheckedKeys);
      }

      this.handleTreeData();
    }
  }
};
</script>

<style lang="less" scoped>
.ticket-tree {
  /deep/ .ant-radio-group {
    .ant-radio-button-wrapper {
      min-width: 74px;
      height: 36px;
      line-height: 34px;
      text-align: center;
    }
  }

  &-table {
    // margin-top: 10px;
  }

  &-dialog {
    margin-top: 0;
  }

  &-content {
    max-height: 120px;
    margin-top: 20px;
    padding: 16px;
    overflow: hidden;
    border-style: solid;
    border-width: 1px;
    border-radius: 4px;
  }

  &-scroller {
    max-height: 280px;
    margin-top: 10px;
    overflow-x: hidden;
    overflow-y: auto;
  }

  &-select-row {
    display: flex;
    align-items: center;

    .ticket-tree-content {
      flex: 1;
      margin-top: 0;
      margin-left: 20px;
      padding: 0;
      border-width: 0;
    }
  }
}
</style>
