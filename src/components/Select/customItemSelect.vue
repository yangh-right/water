<template>
  <w-select
    v-click-outside="onClickOutside"
    class="supply-w-full"
    v-on="$listeners"
    v-bind="$attrs"
    v-model="key"
    :open="open"
    @click.native="toggleSelect"
    @select="selectOption"
    @change="change"
  >
    <div
      slot="dropdownRender"
      slot-scope="menu"
      @click="
        e => {
          e.stopPropagation();
        }
      "
    >
      <v-nodes :vnodes="menu" />
      <w-divider style="margin: 4px 0" />
      <div class="supply-flex supply-items-center" style="padding: 0px 8px 4px">
        <w-input
          class="input-txt supply-flex-1"
          v-model="text"
          placeholder="自定义"
          allowClear
          @pressEnter="addItem"
        />
        <a><w-icon type="check" @click="addItem" class="supply-ml-3"></w-icon></a>
      </div>
    </div>
    <slot></slot>
  </w-select>
</template>
<script>
export default {
  props: {
    value: {
      type: String | Array | Number,
      default: undefined
    },
    list: {
      type: Array,
      required: () => []
    }
  },
  components: {
    VNodes: {
      functional: true,
      render: (h, ctx) => ctx.props.vnodes
    }
  },
  data() {
    return {
      key: this.value,
      open: false,
      clickHandle: null,
      text: ''
    };
  },
  watch: {
    value(val) {
      this.key = val;
    }
  },
  methods: {
    onClickOutside(event) {
      this.open = false;
    },
    addItem() {
      if (this.text && !this.list.find(item => item.value === this.text)) {
        this.list.push({ value: this.text, label: this.text });
        this.key = this.text;
        this.change(this.key);
        this.$emit('change', this.key);
        this.open = false;
        this.text = '';
      }
    },
    toggleSelect() {
      this.open = !this.open;
    },
    selectOption(value) {
      this.open = false;
    },
    change(val) {
      this.$emit('input', val);
    }
  },
  beforeDestroy() {
    this.open = false;
  }
};
</script>

<style scoped></style>
