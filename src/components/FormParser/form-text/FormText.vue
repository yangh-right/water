<template>
  <div class="form-text" :style="textStyle">{{ value }}</div>
</template>

<script>
export default {
  name: 'FormText',
  props: {
    value: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#141414',
    },
    fontSize: {
      type: Number,
      default: 14,
    },
    align: {
      type: String,
      default: 'left',
    },
    bold: {
      type: Boolean,
      default: false,
    },
    italic: {
      type: Boolean,
      default: false,
    },
    through: {
      type: Boolean,
      default: false,
    },
    underline: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    textStyle() {
      let { fontSize, underline, through, bold, italic, align } = this;
      return {
        color: this.color,
        fontSize: `${fontSize}px`,
        textAlign: `${align}`,
        fontWeight: bold ? 'bold' : 'normal',
        fontStyle: italic ? 'italic' : 'normal',
        textDecoration: underline ? 'underline' : through ? 'line-through' : 'none',
      };
    },
  },
};
</script>
