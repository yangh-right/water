<template>
  <w-select
  :value="currentValue"
  show-search
  :filterOption="filterOption"
  labelInValue
  :tree-data="data"
  mode="default"
  @popupScroll="popupScroll"
  @change="changeValue"
  >
    <w-select-option v-for="item in data" :value="item.id" :key="item.id" :label="item.materielName">
      {{ item.materielName}}
    </w-select-option>
  </w-select>
</template>

<script>
import { getBaseMaterielList } from '@/api/warehouse';
import { result } from 'lodash-es';

export default {
  name: 'select-materiel',

  props: {
    value: {
      type: Number | Object
    },

    depotId: {
      type: Number | String,
      default: ''
    },
    materielTypeId: {
      type: Number | String,
      default: ''
    },

    valueText: {
      type: String
    }
  },

  data() {
    return {
      isLoading: false,
      page: {
        current: 1,
        size: 20
      },
      data: [],
      currentValue: {},
      total: 0,
      pages: 0
    }
  },

  watch: {
    depotId: {
      handler(val) {
        if (!val) return
        this.data = [];
        this.getBaseMaterielList();
      },
      immediate: true
    },
    materielTypeId: {
      handler(val) {
        if (!val) return
        this.data = [];
        this.getBaseMaterielList();
      },
      immediate: true
    },

    value: {
      handler(val) {
        if (val) {
          this.currentValue = {
            key: val,
            label: this.valueText
          };
        }
      },
      immediate: true
    }
  },

  methods: {
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    async getBaseMaterielList() {
      if (this.isLoading) return 
      this.isLoading = true
      this.currentValue = {};
      let params = {
        depotId: this.depotId,
        materielTypeId: this.materielTypeId,
        page: this.page
      }
      let res = await getBaseMaterielList(params);

      if (res.status === 'complete') {
        let { resultData } = res;
        if (this.page.current === 1) {
          this.total = resultData.total;
          this.pages = resultData.pages
        }
        if (resultData.records && resultData.records.length) {
          this.data = this.data.concat(resultData.records)
        }
      }
      this.isLoading = false
    },

    popupScroll(e) { //滚动分页
      const { target } = e;
      if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
        if (this.page.current < this.pages) {
          this.page.current += 1;
          this.getBaseMaterielList();
        }
      }
    },

    changeValue(value) {
      this.currentValue = value;
      this.$emit('change', value);
    }
  }

}
</script>

<style>

</style>
