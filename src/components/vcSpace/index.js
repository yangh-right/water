import { isNumber, isString } from 'lodash-es';

const GB = {
  sizeMap: {
    small: 8,
    middle: 16,
    large: 24,
  },
};

export default {
  name: 'VcSpace',
  props: {
    block: Boolean,
    size: {
      type: [String, Number],
      default: 'small',
      validator(value) {
        return isNumber(value) || ['small', 'middle', 'large'].includes(value);
      },
    },
    direction: {
      type: String,
      default: 'horizontal',
      validator(value) {
        return ['vertical', 'horizontal'].includes(value);
      },
    },
    align: {
      type: String,
      validator(value) {
        return ['start', 'end', 'center', 'baseline'].includes(value);
      },
    },
  },
  computed: {
    spaceStyle() {
      const align = this.align;
      const size = this.size;
      let style = { display: 'inline-flex' };

      // 块级铺满
      if (this.block) {
        style.display = 'flex';
        style.width = '100%';
      }

      // 对齐方式
      if (align) {
        if (['start', 'end'].includes(align)) {
          style.alignItems = `flex-${align}`;
        } else {
          style.alignItems = align;
        }
      }

      // 间距方向
      if (this.direction === 'vertical') {
        style.flexDirection = 'column';
      }

      // 间距大小
      let _size = size;
      if (isString(size)) {
        _size = GB.sizeMap[size] ?? GB.sizeMap.small;
      }
      style.gap = `${_size}px`;

      return style;
    },
  },
  render(h) {
    return h(
      'div',
      {
        class: ['vc-space'],
        style: this.spaceStyle,
      },
      this.$scopedSlots.default?.()
    );
  },
};
