<template>
  <w-range-picker
    :value="sValue"
    :open="sOpen"
    :mode="['month', 'month']"
    :disabled="disabled"
    :readonly="readonly"
    :separator="separator"
    :placeholder="placeholder"
    :format="format"
    :value-format="valueFormat"
    :allow-clear="allowClear"
    @change="handleChange"
    @panelChange="handlePanelChange"
    @openChange="handleOpenChange"
  />
</template>

<script>
import shallowequal from "shallowequal";

export default {
  name: "VcRangeTime",

  props: [
    "value",
    "separator",
    "placeholder",
    "format",
    "value-format",
    "readonly",
    "disabled",
    "allow-clear"
  ],

  data() {
    return {
      startValue: null,
      endValue: null,
      sValue: this.value,
      sOpen: false
    };
  },

  watch: {
    value(val) {
      const value = val || [];

      if (!shallowequal(val, this.sValue)) {
        this.sValue = value;
      }
    }
  },

  methods: {
    handleChange(v) {
      this.$emit("change", v);
    },

    handleOpenChange(status) {
      this.sOpen = !!status;
    },

    handlePanelChange(v) {
      let [start, end] = v;
      let value = [
        start.format(this.valueFormat),
        end.format(this.valueFormat)
      ];
      // console.log(value);
      // this.sOpen = false;
      this.sValue = value;
      this.$emit("change", value);
    }
  }
};
</script>
