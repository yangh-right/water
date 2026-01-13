<template>
  <div
    v-show="source.visible"
    ref="node"
    class="vc-tree-node"
    :class="{
      'is-expanded': expanded,
      'is-current': source.isCurrent,
      'is-hidden': !source.visible,
      'is-current-key': source.currentKey == source.key,
      'is-focusable': !source.disabled,
      'is-checked': !source.disabled && source.checked,
      'is-leaf': source.isLeaf || source.data.isUseParent
    }"
    role="treeitem"
    tabindex="-1"
    :aria-expanded="expanded"
    :aria-disabled="source.disabled"
    :aria-checked="source.checked"
    @click.stop="handleClick"
    @contextmenu="$event => this.handleContextMenu($event)"
  >
    <div class="vc-tree-node__content" :title="source.label">
      <span aria-hidden="true" :style="{ width: (source.level - 1) * tree.indent + 'px' }"></span>
      <span
        :class="[
          { 'is-leaf': source.isLeaf, expanded: !source.isLeaf && expanded },
          'vc-tree-node__expand-icon'
        ]"
        @click.stop="handleExpandIconClick"
      >
        <w-icon :type="tree.iconName ? tree.iconName : 'caret-right'" />
      </span>
      <w-checkbox
        v-if="showCheckbox"
        v-model="source.checked"
        :indeterminate="source.indeterminate"
        :disabled="!!source.disabled"
        @click.native.stop
        @change="handleCheckChange"
      >
      </w-checkbox>
      <span v-if="source.loading" class="vc-tree-node__loading-icon vc-icon-loading"> </span>
      <node-content :node="source"></node-content>
      <template v-if="source.isLeaf && source.status != ' '">
        <!-- <i v-if="source.data.label == 'device'" :id="'node'+source.data.id" :class="['icon-ic_equipment_pump', source.data.status == '1' ? 'supply-text-success':'supply-text-invalid']"></i> -->
        <w-icon
          v-if="source.data.label == 'device' || source.data.label == 'industryDevice'"
          :id="'node' + source.data.id.replace(/#/g, '-')"
          type="ic_equipment_pump"
          :class="[source.data.status == '1' ? 'supply-text-success' : 'supply-text-invalid']"
        />
        <!-- <i v-if="source.data.label == 'station'" :id="'node'+source.data.id" :class="['icon-ic_pump_room', source.data.status == '1' ? 'supply-text-success':'supply-text-invalid']"></i> -->
        <w-icon
          v-if="source.data.label == 'station'"
          :id="'node' + source.data.id.replace(/#/g, '-')"
          type="ic_pump_room"
          :class="[source.data.status == '1' ? 'supply-text-success' : 'supply-text-invalid']"
        />
        <!-- <i v-if="source.data.label == 'videoDevice' && source.data.extColumn!=1" :id="'node'+source.data.id" :class="['icon-ic_videocam', source.data.status == '0' ? 'supply-text-success':'supply-text-invalid']"></i> -->
        <w-icon
          v-if="source.data.label == 'videoDevice' && source.data.extColumn != 1"
          :id="'node' + source.data.id.replace(/#/g, '-')"
          type="ic_videocam"
          :class="[source.data.status == '0' ? 'supply-text-success' : 'supply-text-invalid']"
        />
        <!-- <i v-if="source.data.label == 'videoDevice' && source.data.extColumn==1" :class="['icon-ic_videocam_off','supply-text-invalid']"></i> -->
        <w-icon
          v-if="source.data.label == 'videoDevice' && source.data.extColumn == 1"
          type="ic_videocam_off"
          :class="['supply-text-invalid']"
        />
      </template>
    </div>
  </div>
</template>

<script type="text/jsx">
import emitter from './mixins/emitter';
import mixinNode from './mixins/node';

export default {
  name: 'VcTreeVirtualNode',
  componentName: 'VcTreeVirtualNode',

  components: {
    NodeContent: {
      props: {
        node: {
          required: true
        }
      },
      render(h) {
        const parent = this.$parent;
        const tree = parent.tree;
        const node = this.node;
        const { data, store } = node;
        return (
          parent.renderContent
            ? parent.renderContent.call(parent._renderProxy, h, { _self: tree.$vnode.context, node, data, store })
            : tree.$scopedSlots.default
              ? tree.$scopedSlots.default({ node, data })
              : <span class="vc-tree-node__label">{ node.label }</span>
        );
      }
    }
  },

  mixins: [emitter, mixinNode],

  props: {
    source: {
      default() {
        return {};
      }
    },
    currentNodeKey: [String, Number],
    renderContent: Function,
    showCheckbox: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tree: null,
      expanded: false,
      childNodeRendered: false,
      oldChecked: null,
      oldIndeterminate: null
    };
  },

  watch: {
    'source.indeterminate'(val) {
      this.handleSelectChange(this.source.checked, val);
    },

    'source.checked'(val) {
      this.handleSelectChange(val, this.source.indeterminate);
    },

    'source.expanded'(val) {
      this.$nextTick(() => this.expanded = val);
      if (val) {
        this.childNodeRendered = true;
      }
    }
  },
  created() {
    const parent = this.$parent.$parent.$parent;
    this.creator(parent, 'source');
  }
};
</script>
