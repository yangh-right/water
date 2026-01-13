<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-08-15 20:28:10
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-08-17 15:38:28
 * @Description: 
-->
<template>
  <div class="supply-h-full supply-p-3 supply-bg-bg-card-DEFAULT compare-container">
    <w-table
      :pagination="false"
      class="compare-table"
      :customHeaderRow="customHeaderRow"
      :data-source="filterData"
      :columns="columns"
      :scroll="{ y: 480, x: columns.length * 120 }"
    >
      <span slot="customTitle"
        ><span>方案</span
        ><span class="supply-text-secondary supply-text-sm supply-mx-3">仅看差异</span
        ><w-switch v-model="isDiff"></w-switch
      ></span>
      <span slot="name" slot-scope="text, record, index">
        <span :class="{ 'supply-font-semibold': record.isTitle }">{{ text }}</span>
      </span>
    </w-table>
  </div>
</template>
<script>
import cloneDeep from 'lodash.clonedeep';
export default {
  name: 'SchemeCompare',
  props: {
    schemeList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isDiff: true,
      columns: [],
      data: []
    };
  },

  components: {},

  computed: {
    filterData() {
      return this.isDiff ? this.data.filter(item => item.isDiff) : this.data;
    }
  },
  watch: {
    schemeList: {
      handler(val) {
        this.setColumns(val);
        this.setData(val);
      }
    }
  },

  mounted() {},

  methods: {
    setColumns(list) {
      let columns = list?.map(item => {
        return {
          title: item.solutionName,
          dataIndex: item.solutionId
        };
      });
      columns.unshift({
        width: 194,
        dataIndex: 'name',
        scopedSlots: { customRender: 'name' },
        slots: { title: 'customTitle' }
      });
      this.columns = columns;
    },
    setData(list) {
      let dataList = [];
      const modelMap = {};
      list.forEach(item => {
        if (modelMap[item.modelId]) {
          modelMap[item.modelId].push({ solutionId: item.solutionId, moduleList: item.moduleList });
        } else {
          modelMap[item.modelId] = [{ solutionId: item.solutionId, moduleList: item.moduleList }];
        }
      });
      const moduleDataMap = [];
      Object.keys(modelMap).forEach(modelId => {
        const moduleData = {};
        modelMap[modelId].forEach(module => {
          module.moduleList.forEach(group => {
            if (moduleData[group.name]) {
              moduleData[group.name][module.solutionId] = '';
            } else {
              moduleData[group.name] = {
                id: group.name,
                name: group.name,
                [module.solutionId]: '',
                value: [],
                points: group.points.map(item => item.code),
                isDiff: true,
                isTitle: true
              };
            }
            group.points.forEach(point => {
              if (moduleData[point.code]) {
                moduleData[point.code][module.solutionId] = point.value;
                moduleData[point.code].value.push(point.value);
                moduleData[point.code].isDiff = this.isDiffValue(moduleData[point.code].value);
              } else {
                moduleData[point.code] = {
                  id: point.code,
                  name: point.name,
                  [module.solutionId]: point.value,
                  value: [point.value],
                  isDiff: true
                };
              }
            });
          });
        });
        const modelList = Object.values(moduleData)
          .filter(item => item.isTitle)
          .forEach(title => {
            title.isDiff = title.points.some(point => moduleData[point].isDiff);
          });
        dataList = dataList.concat(Object.values(moduleData));
      });
      this.data = dataList;
    },
    customHeaderRow: (column, index) => {
      return {
        class: 'header-row'
      };
    },
    isDiffValue(list) {
      if (!list.length || list.length === 1) {
        return true;
      } else {
        if (list.every(item => list[0] === item)) {
          return false;
        } else {
          return true;
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import '@/styles/switch.less';
.compare-table {
  /deep/ .wpg-table-tbody > .wpg-table-row.even {
    background-color: unset;
  }
  /deep/ .wpg-table-row {
    > td {
      border-bottom: 1px solid var(--supply-color-border-split);
    }
  }
  /deep/ .header-row {
    > th {
      color: var(--supply-color-main);
      font-weight: 500;
      white-space: wrap;
      font-size: 16px;
    }
  }
}
</style>
