<template>
  <div class="sw-sidebar-panel">
    <nav :class="sidebarClasses" class="" :style="sidebarStyles">
      <span class="sw-sidebar-panel__control" @click="handleControl">
        <w-icon class="primary-color" type="menu-fold" v-show="isExpand" />
        <w-icon class="primary-color" type="menu-unfold" v-show="!isExpand" />
      </span>
      <div class="sw-sidebar-panel__sidebar-header" :style="{ width: value }">
        <div class="sw-sidebar-panel__sidebar-title">
          <slot name="sidebar-title" v-if="isExpand">
            <w-icon class="primary-color" type="cluster" />
            <span class="sw-ml">{{ title }}</span>
          </slot>
        </div>
      </div>
      <div
        class="sw-sidebar-panel__sidebar-content i-scrollbar-hide"
        v-show="isExpand"
        :style="{ width: value }"
      >
        <slot name="sidebar" />
      </div>
      <SplitBar @mousedown="handleMousedown" v-show="isExpand && splitDrop" />
    </nav>
    <div class="sw-sidebar-panel__content" :class="panelClasses" :style="contentStyles">
      <slot />
    </div>
  </div>
</template>

<script>
  import SplitBar from './split-bar'
  import { on, off } from '@/utils/dom'
  export default {
    name: 'SidebarPanel',
    components: { SplitBar },
    props: {
      icon: String,
      title: String,
      expand: {
        type: Boolean,
        default: true
      },
      /**
       * 初始默认宽度
       */
      value: {
        type: String,
        default: '200px'
      },
      /**
       * 拖动最小宽度
       */
      min: {
        type: String,
        default: '150px'
      },
      /**
       * 拖动最大宽度
       */
      max: {
        type: String,
        default: '400px'
      },
      /**
       * 是否允许拖动
       */
      splitDrop: {
        type: Boolean,
        default: false
      },
      /**
       * 折叠最小宽度
       */
      collapseWidth: {
        type: String,
        default: '50px'
      }
    },
    computed: {
      sidebarStyles() {
        return {
          width: this.isExpand ? this.value : this.collapseWidth,
          transition: !this.isMoving ? 'width 0.3s ease-in-out' : ''
        }
      },
      contentStyles() {
        return {
          'margin-left': this.isExpand ? this.value : this.collapseWidth,
          'padding-left': '12px',
          'box-sizing': 'border-box',
          transition: !this.isMoving ? 'margin-left 0.3s ease-in-out' : ''
        }
      },

      sidebarClasses() {
        return {
          'sw-sidebar-panel__sidebar': true,
          'is-moving': this.isMoving // 添加样式，禁止后代拖动过程中的复选
        }
      },
      panelClasses() {
        return {
          'is-moving': this.isMoving // 添加样式，禁止后代拖动过程中的复选
        }
      }
    },
    watch: {
      expand(val) {
        this.isExpand = val
      }

    },
    data() {
      return {
        isMoving: false,
        isExpand: this.expand
      }
    },
    methods: {
      handleControl() {
        this.isExpand = !this.isExpand
      },
      handleMousedown(e) {
        this.isMoving = true
        this.initOffset = e.pageX
        this.oldOffset = this.value
        this.isMoving = true
        on(document, 'mousemove', this.handleMove)
        on(document, 'mouseup', this.handleUp)
        this.$emit('on-move-start')
      },
      handleMove(e) {
        const pageOffset = e.pageX
        const offset = pageOffset - this.initOffset
        let width = `${parseFloat(this.oldOffset) + offset}px`
        if (parseFloat(width) < parseFloat(this.min)) width = this.min
        if (parseFloat(width) > parseFloat(this.max)) width = this.max
        this.$emit('input', width)

        console.log(`handleMove`, width, pageOffset, offset)
      },
      handleUp() {
        this.isMoving = false
        off(document, 'mousemove', this.handleMove)
        off(document, 'mouseup', this.handleUp)
        this.$emit('on-move-end')
      }
    }
  }
</script>

<style lang="less">
.sw-sidebar-panel {
  &__control {
    float: right;
    margin: 18px 18px;
  }
  &__sidebar-header {
    padding: 18px 12px;
    .sw-ml {
      padding: 0 10px;
    }
  }
  &__sidebar-content {
    border-top: 1px solid var(--supply-color-border-DEFAULT);
    width: 100%;
    height: calc(100% - 62px);
    overflow: auto;
  }
  // 隐藏滚动条样式
  .i-scrollbar-hide{
    &::-webkit-scrollbar{
      width: 0;
    }
    &::-webkit-scrollbar-track{
      background-color: transparent;
    }
    &::-webkit-scrollbar-thumb{
      // background: #e8eaec;
    }
  }
  &__content {
    position: relative;
  }
}
.primary-color {
  // color: @primary-color
  color: var(--supply-color-primary-DEFAULT);
}
</style>
