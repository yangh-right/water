<template>
  <w-modal
    v-model="visible"
    class="dialog-element img secondary-modal"
    style="z-index: 22"
    :mask="false"
    centered
    :footer="null"
    title="组件选择"
    :getContainer="getContainer"
  >
    <div class="svg-element-img" style="height: 328px; overflow: auto">
      <div class="supply-flex supply-justify-end supply-mb-2">
        <w-button type="primary" v-if="!isComponentEdit" @click="toComponentEdit"
          >组件配置</w-button
        >
      </div>
      <div class="image_wrapper">
        <div v-for="(item, index) in imageElements" :key="item.id" class="component__item">
          <div class="images-list">
            <img
              v-if="item.iconUrl"
              :src="item.iconUrl"
              :alt="item.iconUrl"
              style="width: 100%; height: 100%; object-fit: contain;"
            />
            <!-- 浮层操作 -->
            <div class="imges-ctl">
              <w-tooltip placement="top">
                <template slot="title">
                  <span>删除</span>
                </template>
                <w-icon
                  style="color: #fff"
                  type="delete"
                  @click="delectBaseMapOrIconMsg(item.id)"
                />
              </w-tooltip>
              <div class="imges-ctl-v-s">
                <w-icon
                  type="check-circle"
                  theme="filled"
                  :style="{ fontSize: '16px', color: '#fff' }"
                  @click="chooseImgElementThis(item)"
                />
              </div>
            </div>
          </div>
          <div class="name" :title="item.name">{{ item.name }}</div>
        </div>
      </div>
      <!-- 图片历史列表 -->
      <w-empty class="empty" v-if="!imageElements.length"></w-empty>
    </div>
  </w-modal>
</template>

<script>
import serverConfig from '@/config/server.config';
import { getSvgModulePage, addSvgModule, deleteSvgModule } from '@/api/configuration';
export default {
  name: 'componentListModal',
  components: {},
  inject: ['isComponentEdit'],
  data() {
    return {
      showImgElement: false,
      imageElements: [],
      visible: false
    };
  },

  computed: {},
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.getElementImgList();
        }
      },
      immediate: true
    }
  },
  mounted() {},

  methods: {
    toComponentEdit() {
      this.drillDown({
        path: '/configuration/component'
      });
    },
    /**
     * 获取元素图片列表
     */
    getElementImgList(_type) {
      getSvgModulePage({ page: { size: 10000, current: 1 } }).then(res => {
        if (res.status === 'complete') {
          let arr = [];
          res.resultData?.records?.map((v, index) => {
            arr.push(v);
          });
          this.imageElements = arr;
        }
      });
    },
    chooseImgElementThis(item) {
      let svgData = item.configJson ? JSON.parse(item.configJson) : {};
      svgData.componentId = item.id;
      this.$emit('select', svgData);
      this.visible = false;
    },
    /**
     * 确认底图或者图标是否删除
     * @param id
     */
    delectBaseMapOrIconMsg(id) {
      this.$confirm({
        title: '此操作将删除该组件, 是否继续?',
        content: '',
        okText: '删除',
        cancelText: '取消',
        onOk: () => {
          this.delectBaseMapOrIcon(id);
        },
        onCancel: () => {}
      });
    },
    /**
     * 删除底图或者图标
     */
    delectBaseMapOrIcon(id) {
      deleteSvgModule(id).then(res => {
        if (res.status === 'complete') {
          this.imageElements.forEach((v, index) => {
            if (v.id === id) {
              this.imageElements.splice(index, 1);
            }
          });
          this.$message.success('删除成功');
        }
      });
    },
    hideImageElement() {
      this.showImgElement = false;
    },

    showImageElement() {
      this.showImgElement = true;
    },
    getContainer() {
      return document.querySelector('.configuration-edit-content');
    }
  }
};
</script>
<style lang="less" scoped>
.image_wrapper {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  overflow-y: auto;
}
.svg-element-img {
  position: relative;
  display: flex;
  flex-direction: column;
  .empty {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .image-add {
    width: 49px;
    height: 50px;
    margin: 5px 0 0;
    cursor: pointer;

    .anticon {
      margin: 10px 0;
      font-size: 30px;
    }
  }
  .component__item {
    margin-bottom: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100px;
    .name {
      width: 100%;
      height: 20px;
      line-height: 20px;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .images-list {
    position: relative;
    float: left;
    width: 49px;
    height: 50px;
    margin: 5px;
    overflow: hidden;
    .imges-ctl {
      .edit {
        position: absolute;
        right: 2px;
        top: 2px;
      }
    }
    .imges-ctl,
    .imges-cho {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 99;
      display: none;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.4);

      .anticon-delete {
        position: absolute;
        top: 5px;
        right: 5px;
        color: red;
        font-weight: 600;
        cursor: pointer;
      }

      .imges-ctl-v-s {
        position: absolute;
        top: 50%;
        left: 50%;
        color: #fff;
        font-size: 18px;
        vertical-align: middle;
        transform: translate(-50%, -50%);

        .anticon {
          margin: 0 5px;
        }
      }
    }

    &:hover {
      .imges-ctl {
        display: block;

        .anticon {
          cursor: pointer;

          &:hover {
            color: #20a0ff;
          }
        }
      }

      .imges-ctl-v-s {
        .anticon {
          cursor: pointer;

          &:hover {
            color: #20a0ff !important;
          }
        }
      }
    }

    .imges-cho {
      display: block;

      .anticon {
        position: absolute;
        top: 50%;
        left: 50%;
        margin-top: -15px;
        margin-left: -15px;
        overflow: hidden;
        color: #11b95c;
        font-size: 30px;
        background: #fff;
        border-radius: 50%;
      }
    }
  }
}
</style>
