<template>
  <w-modal
    v-model="visible"
    class="dialog-element img secondary-modal"
    style="z-index: 22"
    :mask="false"
    :footer="null"
    centered
    :destroyOnClose="false"
    title="图片选择"
    :getContainer="getContainer"
  >
    <span class="svg-element-img" style="max-height: 228px; overflow: auto">
      <!-- 图片上传 -->
      <div class="image-add" @click="showImageElement">
        <w-icon type="cloud-upload" class="add-icon" />
      </div>
      <!-- 图片历史列表 -->
      <div v-for="(item, index) in imageElements" :key="item.id" class="images-list">
        <img :src="item.src" :alt="item.src" style="width: 100%; height: 100%; object-fit: contain;" />
        <!-- 浮层操作 -->
        <div class="imges-ctl">
          <w-icon style="color: #fff" type="delete" @click="delectBaseMapOrIconMsg(item.id)" />
          <div class="imges-ctl-v-s">
            <w-icon
              type="check-circle"
              theme="filled"
              :style="{ fontSize: '16px', color: '#fff' }"
              @click="chooseImgElementThis(item.src)"
            />
          </div>
        </div>
      </div>
    </span>
    <ConfigurationUpload
      :showImg="showImgElement"
      tipMassages="可上传jpg、png、gif类型的图片 大小不超过2M"
      :WHVerification="false"
      :isTailoring="false"
      @getResult="addImgElements"
      @cancelResult="hideImageElement"
    >
    </ConfigurationUpload>
  </w-modal>
</template>

<script>
import ConfigurationUpload from './ConfigurationUpload';
import serverConfig from '@/config/server.config';
import { getEUUrlList, addEUSvgSrc, updateSvgSrc } from '@/api/configuration';
export default {
  components: {
    ConfigurationUpload
  },

  data() {
    return {
      showImgElement: false,
      imageElements: [],
      visible: false
    };
  },

  computed: {},
created() {
    this.getElementImgList()
},
  mounted() {

  },

  methods: {
    /**
     *  添加图片元素
     */
    addImgElements(_imgSrc) {
      let self = this;
      let params = {
        url: _imgSrc
      };
      addEUSvgSrc(params)
        .then(res => {
          if (res.status === 'complete') {
            self.imageElements.push({
              src: serverConfig.IMG_BASE_URL + _imgSrc,
              id: res.resultData
            });
            this.$message.success('添加成功');
          }
        })
        .then(() => {
          self.hideImageElement();
        })
        .catch(() => {
          this.$message.error('系统异常,请重试!');
        });
    },
    /**
     * 获取元素图片列表
     */
    getElementImgList(_type) {
      getEUUrlList().then(res => {
        if (res.status === 'complete') {
          let arr = [];
          res.resultData.map((v, index) => {
            arr.push({ src: serverConfig.IMG_BASE_URL + v.elementUrl, id: v.id });
          });
          this.imageElements = arr;
        }
      });
    },
    chooseImgElementThis(_imgSrc) {
      this.$emit('select', _imgSrc);
      this.visible = false
    },
    /**
     * 确认底图或者图标是否删除
     * @param id
     */
    delectBaseMapOrIconMsg(id) {
      this.$confirm({
        title: '此操作将删除该文件, 是否继续?',
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
      updateSvgSrc(id).then(res => {
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
    .svg-element-img {
  display: flex;
  flex-wrap: wrap;

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

  .images-list {
    position: relative;
    float: left;
    width: 49px;
    height: 50px;
    margin: 5px;
    overflow: hidden;

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
