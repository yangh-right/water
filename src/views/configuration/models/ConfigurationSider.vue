<template>
  <div class="configuration-sider supply-bg-bg-card-dark">
    <template v-if="!isComponentEdit">
      <w-form-model
        ref="configurationForm"
        class="configuration-form"
        :model="svgObj"
        :rules="rules"
      >
        <!-- 名称 -->
        <w-form-model-item label="名称:" prop="svgName">
          <w-input
            v-model="svgObj.svgName"
            type="text"
            placeholder="请输入组态名称"
            :maxLength="50"
            allowClear
          />
        </w-form-model-item>
        <w-form-model-item label="编号:" prop="svgCode">
          <w-input
            v-model="svgObj.svgCode"
            type="text"
            placeholder="请输入组态编号"
            :maxLength="50"
            allowClear
          />
        </w-form-model-item>
        <!-- 组态类型 -->
        <w-form-model-item label="组态类型:" prop="svgType">
          <w-select
            v-model="svgObj.svgType"
            placeholder="请选择组态类型"
            allow-clear
            :getPopupContainer="node => node.parentNode"
            @change="changeType"
          >
            <w-select-option v-for="item in svgTypeData" :key="item.dictValue" :value="item.dictValue">
              {{ item.dictName }}
            </w-select-option>
          </w-select>
        </w-form-model-item>
        <!-- 排序 -->
        <w-form-model-item label="组态排序:" prop="svgSort">
          <w-input-number
            v-model="svgObj.svgSort"
            placeholder="请输入排序序号"
            :min="0"
            :max="999999999"
            :setp="1"
            style="width:100%"
          />
        </w-form-model-item>
        <!-- 宽高 -->
        <w-row style="margin-top: -10px; margin-bottom: -10px">
          <w-col :span="12">
            <w-form-model-item label="宽(px):" prop="svgWidth">
              <w-input-number v-model="svgObj.svgWidth" :min="0" :max="999999999" :step="1" />
            </w-form-model-item>
          </w-col>
          <w-col :span="12">
            <w-form-model-item label="高(px):" prop="svgHeight">
              <w-input-number v-model="svgObj.svgHeight" :min="0" :max="999999999" :step="1" />
            </w-form-model-item>
          </w-col>
        </w-row>
        <!-- 比例 -->
        <w-form-model-item label="比例:">
          <span style="color: #606266">底图(宽/高) {{ proportionSvg }}</span>
        </w-form-model-item>
        <!-- 底图 -->
        <w-form-model-item label="底图:">
          <div class="configuration-form-img">
            <div v-if="background" style="width: 100%; height: 100%">
              <img style="width: 100%; height: 100%" :src="background" :alt="background" />
            </div>
            <div v-else class="configuration-form-uploader supply-text-icon" @click="showImgCm">
              <w-icon type="plus" style="font-size: 30px" />
            </div>
          </div>
        </w-form-model-item>
        <!-- 创建图形 -->
        <w-row
          v-show="background && svgObj.svgType === 'plant_info_svg'"
          class="configuration-form-elements"
          style="margin-top: 20px"
          :gutter="20"
        >
          <w-col :span="8">
            <w-button block size="small" @click="openComponentModal" style="margin-bottom: 5px;">
              组件
            </w-button>
          </w-col>
          <w-col v-for="item in elements" :key="item.action" :span="8">
            <w-button
              block
              size="small"
              @click="handleCreateElement(item.action)"
              style="margin-bottom: 5px;"
            >
              {{ item.label }}
            </w-button>
          </w-col>
        </w-row>

        <w-row
          v-show="background && svgObj.svgType === 'plant_inspection_svg'"
          class="configuration-form-elements"
          style="margin-top: 20px"
        >
          <w-col v-for="item in components" :key="item.id" :span="12">
            <w-button
              :title="item.stepName"
              @click="handleCreateCom(item)"
              style="margin-bottom: 5px;"
            >
              {{ item.stepName }}
            </w-button>
          </w-col>
        </w-row>
      </w-form-model>
      <w-row v-if="configurationId" class="configuration-form-submit" :gutter="30">
        <w-col :span="waterPlantId ? 24 : 12">
          <w-button block type="primary" :loading="loading.update" @click="update"
            >保存修改</w-button
          >
        </w-col>
        <w-col :span="12">
          <w-button v-if="!waterPlantId" block type="primary" @click="save">另存为</w-button>
        </w-col>
      </w-row>
      <w-row v-else class="configuration-form-submit" :gutter="30">
        <w-col :span="24">
          <w-button block type="primary" :loading="loading.create" @click="create"
            >保存设置</w-button
          >
        </w-col>
      </w-row>
    </template>
    <template v-else>
      <w-form-model
        ref="configurationForm"
        class="configuration-form"
        style="padding-top: 12px;"
        :model="svgObj"
        :rules="rules"
      >
        <!-- 宽高 -->
        <w-row style="margin-top: -10px; margin-bottom: -10px">
          <w-col :span="12">
            <w-form-model-item label="宽(px):" prop="svgWidth">
              <w-input-number v-model="svgObj.svgWidth" :min="0" :max="999999999" :step="1" />
            </w-form-model-item>
          </w-col>
          <w-col :span="12">
            <w-form-model-item label="高(px):" prop="svgHeight">
              <w-input-number v-model="svgObj.svgHeight" :min="0" :max="999999999" :step="1" />
            </w-form-model-item>
          </w-col>
        </w-row>
        <!-- 底图 -->
        <w-form-model-item label="底图:">
          <div class="configuration-form-img">
            <div v-if="background" style="width: 100%; height: 100%">
              <img style="width: 100%; height: 100%" :src="background" :alt="background" />
            </div>
            <div v-else class="configuration-form-uploader supply-text-icon" @click="showImgCm">
              <w-icon type="plus" style="font-size: 30px" />
            </div>
          </div>
        </w-form-model-item>
        <!-- 创建图形 -->
        <w-row class="configuration-form-elements" :gutter="20">
          <w-col :span="8">
            <w-button block size="small" @click="openComponentModal" style="margin-bottom: 5px;">
              组件
            </w-button>
          </w-col>
          <w-col v-for="item in elements" :key="item.action" :span="8">
            <w-button
              block
              size="small"
              @click="handleCreateElement(item.action)"
              style="margin-bottom: 5px;"
            >
              {{ item.label }}
            </w-button>
          </w-col>
        </w-row>
      </w-form-model>
    </template>
    <!-- 底图历史库 -->
    <w-modal
      class="secondary-modal"
      v-model="dialogImages"
      title="底图选择"
      centered
      width="880px"
      @ok="siteSvgBgImg"
      @cancel="cancelSiteSvgBgImg"
    >
      <!-- 底图展示区域  -->
      <div class="dialog-img" style="max-height: 558px">
        <div class="image-add">
          <w-upload-dragger
            name="file"
            :data="{ folder: 'config' }"
            :headers="headers"
            :action="uploadAction"
            :show-upload-list="false"
            @change="handleChange"
          >
            <p class="ant-upload-drag-icon">
              <w-icon type="inbox" />
            </p>
            <p class="ant-upload-text">
              点击或将图片拖拽到这里上传
            </p>
            <p>只能上传jpg/png文件，且不超过2M</p>
          </w-upload-dragger>
        </div>
        <!-- 图片历史列表 -->
        <div v-for="item in imageHistory" :key="item.id" class="image-list">
          <div>
            <img :src="item.url" :alt="item.url" style="width: 200px; height: 100px" />
            <p class="supply-whitespace-nowrap supply-overflow-hidden">
              <w-popover trigger="hover" placement="bottomLeft" :content="item.name">
                <span class="supply-cursor-pointer">{{ item.name }}</span>
              </w-popover>
            </p>
          </div>
          <div v-show="item.status" class="imges-cho">
            <w-icon
              type="check-circle"
              theme="filled"
              :style="{ fontSize: '30px', color: '#52c41a', height: '30px' }"
            />
          </div>

          <!-- 查看底图展示的浮层-->
          <div v-show="!item.status" class="imges-ctl">
            <w-icon type="delete" @click="delectBaseMapOrIconMsg(item.id, 'baseMap')" />
            <div class="imges-ctl-v-s">
              <w-popover trigger="click" placement="right" width="600">
                <img slot="content" :src="item.url" style="max-width: 600px; max-height: 300px" />
                <w-icon type="eye" />
              </w-popover>
              |
              <w-icon
                type="check-circle"
                theme="filled"
                :style="{ fontSize: '20px', color: '#fff' }"
                @click="chooseThis(item.url)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 底图列表页码  -->
      <w-pagination
        v-if="total"
        class="supply-float-right"
        :current="page"
        :pageSize="pageSize"
        :total="total"
        show-quick-jumper
        @change="onChange"
      />
    </w-modal>
    <component-modal @select="handleCreateComponent" ref="componentModal"></component-modal>
  </div>
</template>

<script>
import 'svg.js';
import 'svg.draggable.js';
import 'svg.resize.js';
import 'svg.select.js';
import Bus from '../Bus.js';
import { elements } from '../configurationConfig';
import serverConfig from '@/config/server.config';
import { getPicUrlList, addSvgSrc, updateSvgSrc, getDistinctConfigList } from '@/api/configuration';
import { sysDictListByCode, InspConfigList } from '@/api/manage';
import storage from '@/utils/storage';
import { accessToken } from '@wpg/framework-vue';
import componentModal from './componentModal';
export default {
  name: 'ConfigurationSider',
  components: {
    componentModal
  },
  inject: ['isComponentEdit'],
  props: {
    configurationId: {
      type: String,
      default: ''
    },
    background: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      headers: {},
      uploadAction: `${serverConfig.API_BASE_URL}/fileManage/uploadByBucket`,
      svgTypeData: [],
      elements,
      components: [],
      proportionSvg: '3.13 / 1', // 建议底图的比例
      rules: {
        svgName: [{ required: true, message: '组态名称不能为空' }],
        svgCode: [{ required: true, message: '组态编号不能为空' }],
        svgType: [{ required: true, message: '组态类型不能为空' }]
      },

      showImgElement: false,
      dialogImages: false,
      // 分页加载底图
      page: 1, // 当前页码
      pageSize: 15, // 每页数据量
      total: '', // 总数据量，根据实际情况获取
      tempImageHistory: [], // 底图所有数据
      imageHistory: [], // 当前展示底图
      /* 当前选择的底图 */
      svgBgImgStatus: false, // 底图选择状态
      svgBgImg: '', // 当前选择的底图
      svgBgImgPre: '', // 最终确定选择的底图

      /* svg 实例化对象 */
      svgDraw: '', // svg实例绑定Dom后的对象
      svgDrawId: '', // svgDOM的id
      svgObj: {
        svgName: '', // svg 的名称
        svgCode: '',
        svgType: 'plant_info_svg', // 组态类型，巡检或详情组态
        svgSort: '',
        svgWidth: 1860,
        svgHeight: 870,
        id: '' // svg 唯一标示
      },

      svgElementType: '', // svg 元素的类型

      /* svg 元素 Dom 存储 */
      svgElementDomList: [],
      svgElements: [], // svg 元素id

      // 按钮Loading状态
      loading: {
        update: false,
        save: false,
        create: false
      }
    };
  },

  watch: {
    'svgObj.svgType': {
      handler(val) {
        this.$emit('updateSvgType', val);
      },
      immediate: true
    }
  },
  created() {
    this.sysDictListByCode('plant_svg_type', 'svgTypeData');
    this.InspConfigList();
    this.initComponentPage();
    const token = `Bearer ${accessToken.get()}`;
    this.headers = { Authorization: token };
    Bus.$on('loadSvg', this.busLoadSvg);
    Bus.$on('loadingStatus', this.busLoadingStatus);
    Bus.$on('cancelChange', this.busCancelChange);
  },

  beforeDestroy() {
    Bus.$off('loadSvg', this.busLoadSvg);
    Bus.$off('loadingStatus', this.busLoadingStatus);
    Bus.$off('cancelChange', this.busCancelChange);
  },

  methods: {
    busCancelChange() {
      if (this._inactive) return;
      this.svgObj.svgType = 'plant_inspection_svg';
    },
    busLoadingStatus(type, status) {
      if (this._inactive) return;
      this.loading[type] = status;
    },
    busLoadSvg(svgObj) {
      if (this._inactive) return;
      let svg = {
        id: svgObj.id,
        svgName: svgObj.svgName,
        svgCode: svgObj.svgCode,
        svgType: svgObj.svgType,
        svgSort: svgObj.svgSort,
        svgHeight: svgObj.svgHeight,
        svgWidth: svgObj.svgWidth
      };
      this.svgObj = { ...svg };
    },
    async initComponentPage() {
      if (!this.isComponentEdit) return;
      await this.getBaseMapList();
      if (this.imageHistory?.[0]) {
        this.chooseThis(this.imageHistory[0].url);
        setTimeout(() => {
          this.siteSvgBgImg();
        }, 500);
      }
    },
    changeType() {
      Bus.$emit('changeType', this.svgObj.svgType);
    },
    InspConfigList() {
      getDistinctConfigList().then(res => {
        const { resultData } = res;
        this.components = [];
        this.components = resultData.filter(r => r.delFlag === 0);
      });
    },
    async sysDictListByCode(code, data) {
      const res = await sysDictListByCode(code);
      this[data] = res.resultData;
    },
    handleChange(info) {
      const status = info.file.status;
      if (status === 'done') {
        if (info.file.response.status === 'complete') {
          this.addBaseMap(info.file.response.resultData.url, info.file.response.resultData.oldName);
        } else {
          this.$message.error(info.file.response.errorMessage);
        }
      } else if (status === 'error') {
        this.$message.error('上传失败');
      }
    },

    create() {
      this.checkForm().then(valid => {
        valid && Bus.$emit('create', this.svgObj);
      });
    },

    save() {
      this.checkForm().then(valid => {
        valid && Bus.$emit('save', this.svgObj);
      });
    },

    update() {
      this.checkForm().then(valid => {
        valid && Bus.$emit('update', this.svgObj);
      });
    },

    /**
     * 表单验证
     */
    checkForm() {
      return new Promise(resolve => {
        if (!this.svgObj.svgName) {
          this.$message.error('组态名称不能为空');
          resolve(false);
        } else if (!this.svgObj.svgType) {
          this.$message.error('组态类型不能为空');
          resolve(false);
        } else {
          resolve(true);
        }
      });
    },

    /**
     * 弹出底图上传框
     */
    showImgCm() {
      this.getBaseMapList();
      this.dialogImages = true;
    },

    /**
     * 增加底图
     */
    addBaseMap(url, name) {
      addSvgSrc({ url, name }).then(res => {
        if (res.status === 'complete') {
          this.tempImageHistory.push({
            url: serverConfig.IMG_BASE_URL + url,
            id: res.resultData,
            status: false,
            name: name
          });
          // 重新加载当前页码的应该显示的底图
          this.loadPageData(this.page, this.pageSize);
          this.$message.success('添加成功');
        }
      });
    },

    /**
     * 选择底图
     */
    chooseThis(imgUrl) {
      this.svgBgImg = imgUrl;
      this.imageHistory.forEach((v, i) => {
        this.imageHistory[i].status = false;
        if (v.url === imgUrl) this.imageHistory[i].status = true;
      });
    },

    /**
     * 删除底图或者图标
     */
    delectBaseMapOrIcon(id, type) {
      updateSvgSrc(id).then(res => {
        if (res.status === 'complete') {
          if (type === 'elementImg') {
            // 元素图片
            this.imageElements.forEach((v, index) => {
              if (v.id === id) {
                this.imageElements.splice(index, 1);
              }
            });
          }

          if (type === 'baseMap') {
            // 从临时储存的所有底图中找到对应的底图删除
            this.tempImageHistory.forEach((v, index) => {
              if (v.id === id) {
                this.tempImageHistory.splice(index, 1);
              }
            });
            // 重新加载当前页码的应该显示的底图
            this.loadPageData(this.page, this.pageSize);
          }
          this.$message.success('删除成功');
        }
      });
    },

    /**
     * 确认底图或者图标是否删除
     * @param id
     */
    delectBaseMapOrIconMsg(id, type) {
      this.$confirm({
        title: '此操作将删除该文件, 是否继续?',
        content: '',
        okText: '删除',
        cancelText: '取消',
        onOk: () => {
          this.delectBaseMapOrIcon(id, type);
        },
        onCancel: () => {}
      });
    },

    /**
     * 取消当前选择的底图
     */
    cancelSiteSvgBgImg() {
      this.imageHistory.forEach((v, i) => {
        this.imageHistory[i].status = false;
        if (v.url === this.svgBgImgPre) this.imageHistory[i].status = true;
      });
      this.dialogImages = false;
    },

    /**
     * 确认使用当前选择的底图
     */
    siteSvgBgImg() {
      this.svgBgImgStatus = true;
      this.svgBgImgPre = this.svgBgImg;
      this.$emit('update:background', this.svgBgImgPre);
      this.dialogImages = false;
      this.$emit('changeConfig', 'svgAddBgImg', this.svgBgImgPre);
    },

    /**
     * 获取底图列表
     */
    async getBaseMapList() {
      // 重新从第一页开始展示数据
      this.page = 1;
      await getPicUrlList().then(res => {
        if (res.status === 'complete') {
          this.total = res.resultData.length;
          this.tempImageHistory = res.resultData.map(v => {
            return {
              url: serverConfig.IMG_BASE_URL + v.picUrl,
              id: v.id,
              name: v.picName,
              status: false
            };
          });
          // 默认展示第一页的底图数据
          this.imageHistory = this.tempImageHistory.slice(0, this.pageSize);
          return;
        }
      });
    },
    openComponentModal() {
      this.$refs.componentModal.visible = true;
    },
    onChange(page, pageSize) {
      this.page = page;
      this.pageSize = pageSize;
      this.loadPageData(page, pageSize);
    },
    // 模拟分页加载数据，从临时保存的数组中取到对应页码的数据
    loadPageData(page, pageSize) {
      const startIndex = (page - 1) * pageSize;
      this.$set(
        this,
        'imageHistory',
        this.tempImageHistory.slice(startIndex, startIndex + pageSize)
      );
    },

    handleCreateElement(elementType) {
      this.$emit('create-element', elementType);
    },
    handleCreateComponent(component) {
      this.$emit('create-component', component);
    },

    handleCreateCom(item) {
      this.$emit('create-com', item);
    }
  }
};
</script>

<style lang="less" scoped>
.configuration-sider {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.configuration-form {
  flex: 1;
  padding: 0 10px 0 10px;
  height: calc(100% - 56px);
  overflow: auto;
  background-color: var(--supply-color-bg-card-DEFAULT);

  /deep/ .ant-form-item {
    display: flex;
    margin: 10px 0;

    .ant-form-item-label {
      width: 65px;
      padding-right: 5px;
      text-align: right;
    }

    .ant-form-item-control-wrapper {
      flex: 1;
      overflow: hidden;
    }

    input[type='number'] {
      padding-right: 0;
    }
  }

  &-img {
    width: 153px;
    height: 65px;
    line-height: 80px;
    text-align: center;
    border: 1px #ccc dotted;
  }

  &-uploader {
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  &-elements {
    padding: 0 10px;

    .ant-col {
      margin-bottom: 10px;
    }
  }

  &-submit {
    padding: 10px 20px;
  }
}

.dialog-img {
  max-height: 500px;
  overflow: auto;

  .image-add {
    float: left;
    width: 23%;
    height: 103px;
    margin: 5px;
    text-align: center;
    cursor: pointer;
    .ant-upload-drag-icon,
    .ant-upload-text {
      margin: 0;
    }
  }

  .image-list {
    position: relative;
    float: left;
    width: 23%;
    height: 123px;
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
      height: calc(100% - 22px);
      background: rgba(0, 0, 0, 0.4);

      .anticon-delete {
        position: absolute;
        top: 5px;
        right: 5px;
        color: red;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
      }

      .imges-ctl-v-s {
        position: absolute;
        top: 50%;
        left: 50%;
        color: #fff;
        font-size: 20px;
        vertical-align: middle;
        transform: translate(-50%, -50%);

        i {
          margin: 0 5px;
        }
      }
    }

    &:hover {
      .imges-ctl {
        display: block;

        i {
          cursor: pointer;

          &:hover {
            color: #20a0ff;
          }
        }
      }
    }

    .imges-cho {
      display: block;

      i {
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

  .image-add {
    .anticon-upload {
      font-size: 40px;
    }

    p {
      margin-top: 10px;
      font-size: 12px;
    }
  }

  .image-list {
    // line-height: 100px;
    text-align: center;

    img {
      max-width: 200px;
      max-height: 100px;
      vertical-align: middle;
    }
  }
}
.configuration-form-elements {
  .ant-col-12 {
    .ant-btn {
      width: 90%;
      // display: inline-block;
      // white-space: nowrap;
      // text-overflow: ellipsis;
      // overflow: hidden;
      padding: 0;
      /deep/span {
        width: 90%;
        display: inline-block;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }
}
</style>
