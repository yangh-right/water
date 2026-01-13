<template>
  <w-layout
    class="configuration-edit-box supply-bg-bg-card-DEFAULT"
    :class="[isFullScreen ? 'full-screen' : '']"
  >
    <div class="configuration-edit-header">
      <w-button
        v-for="act in actionButtons"
        :key="act.action"
        size="small"
        :disabled="isMultiple && !act.isMultiple"
        @click="handleAction(act.action)"
      >
        {{ act.action === 'select' ? (isMultiple ? '结束框选' : '框选') : act.name }}
      </w-button>
      <w-button size="small" @click="isShowGuide = !isShowGuide">
        {{ isShowGuide ? '关闭网格' : '显示网格' }}
      </w-button>
      <w-button size="small" @click="isFullScreen = !isFullScreen">
        {{ isFullScreen ? '最小化' : '全屏' }}
      </w-button>
      <w-select v-model="svgZoomValue" style="width: 170px" placeholder="缩放设置">
        <w-select-option v-for="item in zooms" :key="item.value" :value="item.value">
          {{ item.label }}
        </w-select-option>
      </w-select>
      <return-control :keep="true" :is-drill-down="true" style="float: right;"></return-control>
      <!-- <w-button size="small"  @click="returnBack">返回</w-button> -->
    </div>
    <w-layout class="configuration-edit-draw supply-bg-bg-card-DEFAULT">
      <div class="configuration-edit-content supply-border-border-split">
        <ConfigurationPreview
          ref="container"
          v-bind="svgConfig"
          :configurationId="configurationId"
          :waterPlantId="waterPlantId"
          :svgZoomValue="svgZoomValue"
          :isMultiple="isMultiple"
          :width="svgObj.width"
          :height="svgObj.height"
          :showGrid="isShowGuide"
          :background.sync="svgObj.backgroundImage"
          :pathChangeTip.sync="pathChangeTip"
          @multipleSelect="
            value => {
              this.isMultiple = value;
            }
          "
        />
      </div>
      <div class="configuration-edit-toolbar">
        <ConfigurationToolbar
          :showAside="isShowAside"
          :background.sync="svgObj.backgroundImage"
          @btnClick="handleToolEvent"
          @toggleAside="isShowAside = !isShowAside"
        />
      </div>
      <div v-show="isShowAside" class="configuration-edit-sider">
        <ConfigurationSider
          :waterPlantId="waterPlantId"
          :configurationId="configurationId"
          :background.sync="svgObj.backgroundImage"
          @changeConfig="handleToolEvent"
          @updateSvgType="updateSvgType"
          @create-element="handleCreateElement"
          @create-component="handleCreateComponent"
          @create-com="handleCreateCom"
        />
      </div>
    </w-layout>
  </w-layout>
</template>

<script>
import { actions, zooms } from './configurationConfig';
import ConfigurationPreview from './models/ConfigurationPreview';
import ConfigurationToolbar from './models/ConfigurationToolbar';
import ConfigurationSider from './models/ConfigurationSider';
import { mapState, mapMutations } from 'vuex';
import { getPointLists } from '@/api/configuration';
export default {
  name: 'ConfigurationEdit',
  props: {
    isComponentEdit: {
      type: Boolean,
      default: false
    }
  },
  provide() {
    return {
      isComponentEdit: this.isComponentEdit,
      getPointOptions: () => this.pointOptions
    };
  },
  components: {
    ConfigurationPreview,
    ConfigurationToolbar,
    ConfigurationSider
  },

  data() {
    return {
      actions,
      zooms,
      svgType: '',
      pointOptions: [],
      waterPlantId: this.$route.query.waterPlantId,
      configurationId: this.$route.query.id, // '006e38c7531c4f21bb4543c14f17bb71'
      isMultiple: false, // 是否SVG元素框选状态
      isShowGuide: false, // 是否显示网格
      isFullScreen: false,
      isShowAside: true, // 是否展示侧边
      svgZoomValue: '1',
      svgObj: {
        svgName: '', // svg 的名称
        pumpType: '', // 泵房类型
        svgType: '', // 组态类型，巡检或详情组态
        svgSort: '', // svg 的排序
        id: '', // svg 唯一标示
        svgHeight: 870, // svg 的高度
        svgWidth: 1860, // svg 的宽度
        backgroundImage: '' // svg 背景图片
      },

      pathChangeTip: true // 路由跳转提示
    };
  },

  computed: {
    ...mapState('page', ['current', 'opened']),
    svgConfig() {
      return this.isComponentEdit
        ? {
            svgId: 'componentSvgObjId',
            svgBoxOutId: 'componentSvgBoxOut',
            svgBoxId: 'componentSvgBox',
            svgBgImgId: 'componentSvgBgImg'
          }
        : {
            svgId: 'svgObjId',
            svgBoxOutId: 'svgBoxOut',
            svgBoxId: 'svgBox',
            svgBgImgId: 'svgBgImg'
          };
    },
    actionButtons() {
      return this.actions.filter(item => {
        if (item.action !== 'saveComponent') {
          return true;
        } else {
          if (this.svgType === 'plant_info_svg' && this.isComponentEdit) {
            return true;
          } else {
            return false;
          }
        }
      });
    }
  },
  created() {
    this.getPointOptionLit();
  },
  methods: {
    ...mapMutations('page', ['removeOpened']),
    updateSvgType(val) {
      this.svgType = val;
    },
    handleAction(type) {
      // 当前选中的元素
      let container = this.$refs.container;

      if (!this.isMultiple && !container.svgElementId && type !== 'select') {
        this.$message.warn('请选择需要操作的元素！');
      } else {
        container.handleAction(type, container.svgElementId);
      }
    },
    async getPointOptionLit() {
      const params = {
        currentPage: 1,
        pageSize: 10000
      };
      const { resultData, status } = await getPointLists(params);
      if (status === 'complete') {
        this.pointOptions = resultData;
      }
    },
    handleCreateElement(elementType) {
      this.$refs.container.handleCreateElement(elementType);
    },
    handleCreateComponent(componentData) {
      this.$refs.container.handleCreateComponent(componentData);
    },

    handleCreateCom(item) {
      this.$refs.container.handleCreateCom(item);
    },
    handleToolEvent(eventName, ...params) {
      this.$refs.container?.[eventName](params);
    },
    returnBack() {
      if (this.waterPlantId) {
        this.goto({
          path: '/site/configuration',
          query: { waterPlantId: this.waterPlantId }
        });
      } else {
        this.goto({ path: '/configuration' });
      }
    }
  },
  beforeRouteLeave(to, from, next) {
    if (to.path.includes('/configuration/component') || this.isComponentEdit) {
      next();
    } else if (this.pathChangeTip) {
      this.$confirm({
        title: '当前页面数据未保存, 确定要离开!',
        content: '',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.pathChangeTip = false;
          // 销毁组件，避免通过vue-router再次进入时，仍是上次的history缓存的状态
          this.$destroy(true);
          next();
        },
        onCancel: () => {
          next(false);
        }
      });
    } else {
      this.$destroy(true);
      next();
    }
  }
};
</script>

<style lang="less" scoped>
.configuration-edit {
  &-box {
    padding: 0 12px 12px;
    height: 100%;
    &.full-screen {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 999;
      width: 100%;
      height: 100%;
    }
  }

  &-header {
    padding: 10px 0;

    .ant-btn {
      float: left;
      margin-right: 10px;
    }

    /deep/ .ant-select {
      .ant-select-selection--single {
        height: 28px;

        .ant-select-selection__rendered {
          line-height: 28px;
        }
      }
    }
  }

  &-draw {
    flex-direction: row;
  }

  &-content {
    position: relative;
    flex: 1;
    overflow: hidden;
    border-radius: 4px;
    border: 1px dotted;
  }

  &-toolbar {
    width: 25px;
  }

  &-sider {
    width: 290px;
    border-radius: 4px;
    overflow: hidden;
  }
}
</style>
