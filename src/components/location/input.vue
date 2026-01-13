<template>
  <div class="address-input">
    <w-input
      v-model="location"
      @blur="location=$event.target.value"
      v-bind="$attrs"
    />
    <w-button type="primary" @click="handleLocationClick">选点</w-button>
    <location-dialog
      :location="location"
      v-bind="$attrs"
      @change="handleLocationChange"
      ref="locationDialog"
    />
  </div>
</template>

<script>
export default {
  name: "locationInput",
  inheritAttrs: false,
  components: {
    LocationDialog: () => import('./dialog'),
  },
  props: {
    value: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      location: this.value, // 坐标值
      isPassive: false, // 是否被动更新（主动更新才分发，避免引起表单校验）
    }
  },
  watch: {
    value(val) {
      if (val !== this.location) {
        this.isPassive = true;
        this.location = val;
        this.$nextTick(() => {
          this.isPassive = false;
        })
      }
    },
    location(val) {
      !this.isPassive && this.$emit('change', val);
    }
  },
  methods: {
    /**
     * 打开地址弹窗
     */
    handleLocationClick() {
      this.$refs.locationDialog && (this.$refs.locationDialog.visible = true);
    },
    /**
     * 处理地址改变
     * @param latLng
     */
    handleLocationChange(latLng) {
      if (latLng) {
        this.location = latLng.lat + ',' + latLng.lng;
      }
    },
  }
}
</script>

<style lang="less" scoped>
.address-input {
  display: inline-flex;
  width: 100%;

  .ant-btn {
    //height: 32px;
    margin-left: 10px;
  }
}
</style>
