<template>
  <div
    :class="[
      'vc-color-picker',
      disabled ? 'is-disabled' : '',
      size ? `vc-color-picker--${size}` : '',
    ]"
  >
    <div class="vc-color-picker__mask" v-if="disabled"></div>
    <w-popover :title="null" trigger="click" v-model="showPicker">
      <Sketch slot="content" :presetColors="predefine" :value="color" @input="confirmValue" />
      <div class="vc-color-picker__trigger">
        <span class="vc-color-picker__color" :class="{ 'is-alpha': showAlpha }">
          <span
            class="vc-color-picker__color-inner"
            :style="{
              backgroundColor: displayedColor,
            }"
          ></span>
        </span>
        <span
          class="vc-color-picker__icon"
          :style="{ color: color ? '#fff' : '#333' }"
          v-if="!disabled"
        >
          <w-icon type="down" />
        </span>
      </div>
    </w-popover>
  </div>
</template>

<script>
import Sketch from './Sketch';

export default {
  name: 'VcColorPicker',

  components: {
    Sketch,
  },

  props: {
    value: [String, Object],
    disabled: Boolean,
    showAlpha: Boolean,
    size: String,
    colorFormat: String,
    popperClass: String,
    predefine: Array,
  },

  data() {
    return {
      color: this.value,
      showPicker: false,
    };
  },

  computed: {
    displayedColor() {
      return this.color ? this.color : 'transparent';
    },
  },

  watch: {
    value(val) {
      if (val && val !== this.color) {
        this.color = val;
      }
    },
  },

  methods: {
    confirmValue(item) {
      const { r, g, b, a } = item.rgba;
      const value = `rgba(${r}, ${g}, ${b}, ${a})`;

      this.color = value;
      this.$emit('input', value);
      this.$emit('change', value);
    },
  },
};
</script>

<style lang="less">
.vc-color-picker {
  display: inline-block;
  position: relative;
  line-height: normal;
  height: 40px;
}

.vc-color-picker.is-disabled .vc-color-picker__trigger {
  cursor: not-allowed;
}

.vc-color-picker--medium {
  height: 36px;
}

.vc-color-picker--medium .vc-color-picker__trigger {
  height: 36px;
  width: 36px;
}

.vc-color-picker--medium .vc-color-picker__mask {
  height: 34px;
  width: 34px;
}

.vc-color-picker--small {
  height: 32px;
}

.vc-color-picker--small .vc-color-picker__trigger {
  height: 32px;
  width: 32px;
}

.vc-color-picker--small .vc-color-picker__mask {
  height: 30px;
  width: 30px;
}

.vc-color-picker--small .vc-color-picker__empty,
.vc-color-picker--small .vc-color-picker__icon {
  transform: translate3d(-50%, -50%, 0) scale(0.8);
}

.vc-color-picker--mini {
  height: 28px;
}

.vc-color-picker--mini .vc-color-picker__trigger {
  height: 28px;
  width: 28px;
}

.vc-color-picker--mini .vc-color-picker__mask {
  height: 26px;
  width: 26px;
}

.vc-color-picker--mini .vc-color-picker__empty,
.vc-color-picker--mini .vc-color-picker__icon {
  transform: translate3d(-50%, -50%, 0) scale(0.8);
}

.vc-color-picker__mask {
  height: 38px;
  width: 38px;
  border-radius: 4px;
  position: absolute;
  top: 1px;
  left: 1px;
  z-index: 1;
  cursor: not-allowed;
  background-color: hsla(0, 0%, 100%, 0.7);
}

.vc-color-picker__trigger {
  display: inline-block;
  box-sizing: border-box;
  height: 40px;
  width: 40px;
  padding: 4px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 0;
  position: relative;
  cursor: pointer;
}

.vc-color-picker__color {
  position: relative;
  display: block;
  box-sizing: border-box;
  border: 1px solid #999;
  border-radius: 2px;
  width: 100%;
  height: 100%;
  text-align: center;
}

.vc-color-picker__color.is-alpha {
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==);
}

.vc-color-picker__color-inner {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.vc-color-picker__empty {
  color: #999;
}

.vc-color-picker__empty,
.vc-color-picker__icon {
  font-size: 12px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
}

.vc-color-picker__icon {
  display: inline-block;
  width: 100%;
  color: #ccc;
  text-align: center;
}

.vc-color-picker__panel {
  position: absolute;
  z-index: 10;
  padding: 6px;
  box-sizing: content-box;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>
