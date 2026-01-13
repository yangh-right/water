<template>
  <w-modal
    v-if="visible"
    class="draggable-modal secondary-modal"
    v-bind="$attrs"
    v-model="visible"
    :width="width"
    :height="height"
    centered
    :mask="mask"
    :closable="false"
    :footer="null"
    destroyOnClose
  >
    <slot slot="title" name="title">
      <div class="supply-flex supply-items-center supply-cursor-move">
        <span class="supply-mx-auto">{{ title }} <slot name="titleIcon"></slot></span>
        <w-icon
          v-if="isShowFullBtn"
          class="supply-mx-2 supply-cursor-pointer"
          :type="isFullScreen ? 'ic_resize_shrink' : 'ic_resize_enlarge'"
          @click="fullScreen"
        />

        <w-icon
          v-if="!isFullScreen"
          class="supply-mx-2 supply-cursor-pointer"
          type="ic_close"
          @click="visible = false"
        />
      </div>
    </slot>
    <slot v-for="(_, name) in slots" :slot="name" :name="name" />
    <template v-for="(_, name) in scopedSlots" :slot="name" slot-scope="slotData">
      <slot :name="name" v-bind="slotData"></slot>
    </template>
    <div
      v-if="canChangeSize"
      ref="dragHandler"
      class="drag-handler"
      @mousedown="startStretch"
    ></div>
    <slot></slot>
  </w-modal>
</template>

<script>
import { defineComponent } from '@vue/composition-api';
import screenfull from 'screenfull';
export default defineComponent({
  name: 'DragModel',
  props: {
    isShowFullBtn: {
      // 是否显示全屏按钮
      default: true,
      type: Boolean
    },
    isChangeSize: {
      // 是否可拉伸改变宽高
      default: false,
      type: Boolean
    },
    isDrag: {
      // 是否可拖拽
      default: true,
      type: Boolean
    },
    mask: {
      // 是否显示遮罩
      default: false,
      type: Boolean
    },
    title: {
      // 弹框标题
      default: ''
      // type: String
    },
    width: {
      // 弹框宽度
      default: 800,
      type: Number
    },
    height: {
      // 弹框高度
      default: 600,
      type: Number
    },
    minWidth: {
      // 缩放最小宽度
      default: 600,
      type: Number
    },
    minHeight: {
      // 缩放最小高度
      default: 400,
      type: Number
    }
  },
  data() {
    return {
      visible: false,
      isFullScreen: false,
      originalStyle: {},
      dragableElement: null,
      modalHeaderElement: null
    };
  },
  computed: {
    slots() {
      const { default: _default, title, ...resetSlots } = this.$slots;
      return resetSlots;
    },
    scopedSlots() {
      const { default: _default, title, ...resetSlots } = this.$scopedSlots;
      return resetSlots;
    },
    canChangeSize() {
      return !this.isFullScreen && this.isChangeSize;
    }
  },
  watch: {
    visible(val) {
      if (val) {
        setTimeout(() => {
          this.initDragable();
        }, 20);
        this.$emit('open');
      } else {
        this.$emit('close');
      }
    }
  },
  methods: {
    /* 全屏切换 */
    fullScreen() {
      if (this.isFullScreen) {
        this.resetModal(this.dragableElement);
        screenfull.exit();
      } else {
        this.setFullSize(this.dragableElement);
        screenfull.request();
      }
      this.$emit('resize', this.isFullScreen);
      // 全屏时通知到弹窗内视频组件，会调整视频插件位置
      this.$bus.$emit('dragModalResize', this.isFullScreen);
    },
    /* 设置全屏 */
    setFullSize(dragableElement) {
      dragableElement.style.left = 0;
      dragableElement.style.top = 0;
      dragableElement.style.height = '100VH';
      dragableElement.style.width = '100VW';
      dragableElement.style.position = 'fixed';
      this.isFullScreen = true;
      this.modalHeaderElement.style.cursor = 'initial';
      this.modalHeaderElement.onmousedown = null;
    },
    /* 重置弹框大小 */
    resetModal(dragableElement) {
      if (!dragableElement) return false;
      dragableElement.style.height = this.originalStyle.height + 'px';
      dragableElement.style.width = this.originalStyle.width + 'px';
      dragableElement.style.top = this.originalStyle.top;
      dragableElement.style.left = this.originalStyle.left;
      dragableElement.style.position = 'relative';
      this.isFullScreen = false;
      this.modalHeaderElement.style.cursor = this.isDrag ? 'move' : 'initial';
      this.modalHeaderElement.onmousedown = this.startDrag;
    },
    /* 拉伸 */
    startStretch(e) {
      let handler = this.$refs.dragHandler;
      // 记录初始x位置
      const clientX = e.clientX;
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - handler.offsetLeft;
      const disY = e.clientY - handler.offsetTop;

      document.onmousemove = e => {
        e.preventDefault(); // 移动时禁用默认事件
        // 通过事件委托，计算移动的距离 由于modal是居中的，所以水平拉伸效果是双倍
        const x = e.clientX - disX + (e.clientX - clientX);
        const y = e.clientY - disY;
        // 比较是否小于最小宽高
        if (this.dragableElement) {
          this.dragableElement.style.width = x > this.minWidth ? `${x}px` : this.minWidth + 'px';
          this.dragableElement.style.height = y > this.minHeight ? `${y}px` : this.minHeight + 'px';
        }
      };
      // 拉伸结束
      document.onmouseup = function(e) {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    },
    /* 拖拽 */
    startDrag(e) {
      if (!this.isDrag) return;
      // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
      const sty =
        this.dragableElement.currentStyle || window.getComputedStyle(this.dragableElement, null);
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - this.modalHeaderElement.offsetLeft;
      const disY = e.clientY - this.modalHeaderElement.offsetTop;

      // 获取到的值带px 正则匹配替换
      let styL = Number(sty.left.replace(/\px/g, ''));
      let styT = Number(sty.top.replace(/\px/g, ''));
      let dragableElement = this.dragableElement;
      document.onmousemove = function(e) {
        // 通过事件委托，计算移动的距离
        const l = e.clientX - disX;
        const t = e.clientY - disY;

        // 移动当前元素
        dragableElement.style.left = `${l + styL}px`;
        dragableElement.style.top = `${t + styT}px`;
      };

      document.onmouseup = function(e) {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    },
    initDragable() {
      this.dragableElement = document.querySelector('.draggable-modal .wpg-modal');
      if (!this.dragableElement) return;
      // 初始非全屏
      this.isFullScreen =
        this.dragableElement.style.width === '100vw' &&
        this.dragableElement.style.height === '100vh';
      // 记录初始位置和宽高
      this.originalStyle = {
        top: this.dragableElement.style.top,
        left: this.dragableElement.style.left,
        width: this.dragableElement.clientWidth,
        height: this.dragableElement.clientHeight
      };
      // 获取弹框头部 可拖拽弹框
      this.modalHeaderElement = this.dragableElement.querySelector('.wpg-modal-header');
      // 清除选择头部文字效果
      this.modalHeaderElement.onselectstart = () => false;
      this.modalHeaderElement.onmousedown = this.startDrag;
    }
  }
});
</script>

<style lang="less" scoped>
.draggable-modal {
  /deep/ .wpg-modal {
    height: 600px;
    min-height: 300px;
    padding: 0;
    overflow: hidden;

    .wpg-modal-content {
      display: flex;
      flex-direction: column;
      height: 100%;

      .wpg-modal-header {
        padding: 12px 4px;
        background-color: var(--supply-color-bg-card-dark);

        &::after {
          content: unset;
        }
      }

      .wpg-modal-body {
        flex: 1;
        padding: 8px 16px;
        overflow: auto;
      }
    }
  }

  .drag-handler {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 10px;
    height: 10px;
    cursor: se-resize;
  }
}
</style>
