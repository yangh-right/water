/* eslint-disable eqeqeq */
/* eslint-disable no-invalid-this */

import { defineComponent } from '@vue/composition-api';

function calculateWidth(arr) {
  let totalWidth = arr.reduce((sum, cur) => {
    if (cur.children && cur.children.length !== 0) {
      return sum + calculateWidth(cur.children)
    }
    else if (sum == -1) {
      return -1
    }
    else if (!cur.width) {
      console.warn(`${cur.title}必须要有宽度`)
      return -1
    }

    return sum + cur.width
  }, 0)
  return totalWidth
}

export default defineComponent({
  name: 'AutoSizeTable',
  data() {
    return {
      innerScroll: { x: this.$attrs.scroll?.x ?? undefined, y: 'max-content' },
      scrollTable: null,
      observer: null
    };
  },
  mounted() {
    const wrapper = this.$refs.wrapper;
    this.scrollTable = wrapper.querySelector('.wpg-table-body');
    this.attachResize();
    this.scrollTable.addEventListener('scroll', this.handleScroll);
  },
  beforeDestroy() {
    this.observer.disconnect();
    this.scrollTable.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    attachResize() {
      const wrapper = this.$refs.wrapper;
      const table = this.$refs.table.$el;
      // TODO 只有在初始化时才能获取高度，之后可能获取不到, wrapper元素下可以取到
      const title = table.querySelector('.wpg-table .wpg-table-scroll .wpg-table-thead');
      // ! TODO resize-observer-polyfill
      this.observer = new ResizeObserver(() => {
        resetScroll.call(this);
      });
      // 监听包围框变化
      this.observer.observe(wrapper);
      // 这里监听table自己是否撑满包围框
      this.observer.observe(table);
      this.observer.observe(title)
      // 监听clomns变化
      this.$watch(() => this.$attrs.columns, () => {
        resetScroll.call(this)
        
        setTimeout(() => {
          this.scrollTable.removeEventListener('scroll', this.handleScroll)
          this.scrollTable = wrapper.querySelector('.wpg-table-body')
          this.scrollTable.addEventListener('scroll', this.handleScroll);
        }, 300)
      });

      

      function resetScroll() {
        const title = wrapper.querySelector('.wpg-table .wpg-table-scroll .wpg-table-thead');
        const contentHeight = wrapper.offsetHeight - (title?.offsetHeight ?? 0);
        // ! FIXME 1px左右buffer,万一有误差
        if (table.offsetHeight >= wrapper.offsetHeight - 1) {
          this.innerScroll.y = contentHeight;
        } else {
          this.innerScroll.y = undefined;
        }

        // 设置宽度
        // 如果外部传了宽度，则用外部的，否则自己算
        if (this.$attrs.scroll?.x) {
          this.innerScroll.x = this.$attrs.scroll?.x
        } else {
          const totalWidth = calculateWidth(this.$attrs.columns)
          if (totalWidth === -1) {
            this.innerScroll.x = undefined;
          } else {
            if (this.scrollTable.offsetWidth >= totalWidth) {
              this.innerScroll.x = undefined;
            } else {
              this.innerScroll.x = totalWidth;
            }
          }
        }
      }
    },
    handleScroll() {
      const { scrollHeight, offsetHeight, scrollTop } = this.scrollTable;
      if (scrollTop + offsetHeight + 10 >= scrollHeight) {
        this.$emit('load');
      }
    }
  },
  render() {
    return <div ref="wrapper" class="auto-size-table" style={{
      height: '100%',
      overflow: 'hidden'
    }}>
      <w-table ref="table" attrs={this.$attrs} on={this.$listeners} scopedSlots={this.$scopedSlots} pagination={false} scroll={this.innerScroll}>
      </w-table>
    </div>;
  }
});
