<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2022-06-01 08:47:52
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2022-06-02 13:56:17
 * @Description: 
-->
<template>
  <w-modal
    class="secondary-modal"
    v-if="visible"
    title="选取地图坐标点"
    :visible="visible"
    width="80%"
    centered
    :confirm-loading="addressLoading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <location-mark
      v-bind="$attrs"
      :map-key="mapKey"
      open-search
      @loadChange="addressLoading=$event"
      @change="handleLocationChange"
    />
  </w-modal>
</template>

<script>
export default {
  name: "locationDialog",
  inheritAttrs: false,
  components: {
    LocationMark: () => import('./mark'),
  },
  data() {
    return {
      visible: false,  // 弹窗可见性
      mapKey: Date.now(), // 地图key
      addressLoading: false,  // 地址loading
      latLngType: null, // 坐标系类型
      curLocation: null,  // 当前坐标
      curAddress: void 0, // 当前地址
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(val) {
        if (val) {
          this.mapKey = Date.now();
        }
      }
    },
  },
  methods: {
    /**
     * 处理位置变化
     * @param latLngType
     * @param location
     * @param address
     */
    handleLocationChange(latLngType, location, address) {
      this.latLngType = latLngType;
      this.curLocation = location;
      this.curAddress = address;
    },
    /**
     * 确认
     */
    handleOk() {
      this.$emit('change', this.curLocation, this.curAddress, this.latLngType);
      this.handleCancel();
    },
    /**
     * 关闭弹窗
     */
    handleCancel() {
      this.visible = false;
    },
  }
}
</script>

<style scoped lang="less">
/deep/ .wpg-modal {
  padding-bottom: 0;

  &-body {
    height: 60vh;
  }

  &-body, &-footer {
    padding-left: 40px !important;
    padding-right: 40px !important;
  }
}
</style>
