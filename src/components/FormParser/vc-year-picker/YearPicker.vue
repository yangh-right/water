<template>
  <w-date-picker
    mode="year"
    :open="isopen"
    :value="time"
    :disabled="disabled"
    :readonly="readonly"
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
export default {
  name: "VcYearPicker",

  props: [
    "value",
    "placeholder",
    "format",
    "value-format",
    "readonly",
    "disabled",
    "allow-clear"
  ],

  data() {
    return {
      time: this.value,
      isopen: false
    };
  },

  methods: {
    handleChange() {
      this.time = null;
      this.$emit("change", "");
    },

    handleOpenChange(status) {
      this.isopen = !!status;
    },

    handlePanelChange(v) {
      let value = v.format(this.valueFormat);

      this.isopen = false;
      this.time = value;

      this.$emit("change", value);
    }
  }
};
</script>
