<!--
 * @Author: wangyr
 * @Date: 2023-05-24 17:04:49
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-30 15:33:51
 * @Description:
-->
<!--
 * @Author: wangyr
 * @Date: 2023-05-18 10:53:35
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-05-26 08:19:14
 * @Description:
-->
<template>
  <div class="addBatchQuery">
    <div class="addBatchQuery-head">
      <span class="text">{{ !isDiscern ? '新建批次' : '识别采样' }}</span>
      <div class="btn-box">
        <w-button v-if="!isDiscern" type="primary" @click="saveBatch">
          保存批次
        </w-button>
        <w-button style="margin-left: 10px;" @click="getBack">返回</w-button>
      </div>
    </div>
    <div class="addBatchQuery-central">
      <div class="central-h">
        <w-form-model
          v-if="!isDiscern"
          ref="ruleForm"
          :model="addForm"
          layout="inline"
          :rules="rules"
        >
          <w-form-model-item label="选择污水厂" prop="waterPlantId">
            <w-select
              v-model="addForm.waterPlantId"
              allowClear
              style="max-width: 370px;min-width: 200px;width: 370px;"
              placeholder="不限"
              @change="changeWater"
            >
              <w-select-option
                v-for="item of factoryList"
                :key="item.waterPlantId"
                :value="item.waterPlantId"
              >
                {{ item.stationName }}
              </w-select-option>
            </w-select>
          </w-form-model-item>
          <w-form-model-item label=" 取样时间" prop="sampleTime">
            <w-date-picker
              v-model="addForm.sampleTime"
              style="max-width: 370px;min-width: 200px;width: 370px;"
              :showTime="true"
              allowClear
            />
          </w-form-model-item>
          <w-form-model-item label="文件类型" prop="fileType">
            <w-select
              v-model="addForm.fileType"
              allowClear
              style="max-width: 370px;min-width: 200px;width: 370px;"
              placeholder="不限"
            >
              <w-select-option
                v-for="item of fileTypeData"
                :key="item.dictCode"
                :value="item.dictValue"
              >
                {{ item.dictName }}
              </w-select-option>
            </w-select>
          </w-form-model-item>
          <w-form-model-item label="取样位置" prop="sampleLocation">
            <w-select
              v-model="addForm.sampleLocation"
              allowClear
              style="max-width: 370px;min-width: 200px;width: 370px;"
              placeholder="不限"
            >
              <w-select-option
                v-for="item of samplLocation"
                :key="item.dictCode"
                :value="item.dictValue"
              >
                {{ item.dictCode }}
              </w-select-option>
            </w-select>
          </w-form-model-item>
          <w-form-model-item label="目镜" prop="eyepiece">
            <w-select
              v-model="addForm.eyepiece"
              allowClear
              style="max-width: 370px;min-width: 200px;width: 370px;"
              placeholder="不限"
            >
              <w-select-option
                v-for="item of eyepieceData"
                :key="item.dictCode"
                :value="item.dictValue"
              >
                {{ item.dictName }}
              </w-select-option>
            </w-select>
          </w-form-model-item>
          <w-form-model-item label="物镜" prop="objectiveLens">
            <w-select
              v-model="addForm.objectiveLens"
              allowClear
              style="max-width: 370px;min-width: 200px;width: 370px;"
              placeholder="不限"
            >
              <w-select-option
                v-for="item of objectiveLensData"
                :key="item.dictCode"
                :value="item.dictValue"
              >
                {{ item.dictName }}
              </w-select-option>
            </w-select>
          </w-form-model-item>
          <w-form-model-item label="识别状态" prop="status">
            <w-select
              v-model="addForm.status"
              allowClear
              style="max-width: 370px;min-width: 200px;width: 370px;"
              placeholder="不限"
            >
              <w-select-option
                v-for="item of statusData"
                :key="item.dictCode"
                :value="item.dictValue"
              >
                {{ item.dictName }}
              </w-select-option>
            </w-select>
          </w-form-model-item>
        </w-form-model>
        <w-descriptions
          v-if="isDiscern"
          :title="discernObjCopy.batchName"
          style="margin-top: 12px;margin-left: 20px;"
        >
          <w-descriptions-item label="污水厂名称">
            {{ discernObjCopy.batchName }}
          </w-descriptions-item>
          <w-descriptions-item label="取样时间">
            {{ discernObjCopy.createTime }}
          </w-descriptions-item>
          <w-descriptions-item label="文件类型">
            {{ filterParams(discernObjCopy.fileType, fileTypeData) }}
          </w-descriptions-item>
          <w-descriptions-item label="取样位置">
            {{ filterParams(discernObjCopy.sampleLocation, samplLocation) }}
          </w-descriptions-item>
          <w-descriptions-item label="目镜">
            {{ filterParams(discernObjCopy.eyepiece, eyepieceData) }}
          </w-descriptions-item>
          <w-descriptions-item label="物镜">
            {{ filterParams(discernObjCopy.objectiveLens, objectiveLensData) }}
          </w-descriptions-item>
          <w-descriptions-item label="识别状态">
            {{ filterParams(discernObjCopy.status, statusData) }}
          </w-descriptions-item>
        </w-descriptions>
      </div>
      <div class="central-c">
        <div class="title-box">
          <span>取样文件:</span>
          <span v-if="isDiscern" class="centralText">样本{{ imgIndex + 1 }}:</span>
          <div class="upload-box" v-if="!isDiscern">
            <uploadImg ref="uploadImg" v-model="fileList" :type="2"></uploadImg>
            <a @click="emptyStock"><w-icon type="delete" />清空</a>
          </div>
        </div>
        <div class="central-box">
          <div class="central-l" @mouseenter="mouseenter()" @mouseleave="mouseleave()">
            <div
              class="img-box"
              :class="item.status === 2 ? 'img-box1' : ''"
              v-for="(item, index) of fileList"
              :key="item.fileId"
            >
              <img :src="item.fileUrl" />
              <div v-if="item.status === 2" class="authenticated">
                <w-icon class="icon" type="check" />
              </div>
              <div class="img-text">
                <span>{{ item.name }}</span>
              </div>
              <div class="close" v-if="show && isDiscern" @click="enlargement(item, index + 1)">
                <a @click="enlargement(item, index + 1)"><w-icon type="search"/></a>
              </div>
              <div class="close-l" v-if="show && !isDiscern" @click="enlargement(item)">
                <a @click="enlargement(item)"><w-icon type="search"/></a>
              </div>
              <div class="close-r" v-if="show && !isDiscern" @click="closeImg(item)">
                <a><w-icon type="delete"/></a>
              </div>
            </div>
          </div>
          <div class="central-r" v-if="isDiscern">
            <w-table
              :columns="columns"
              :data-source="editBatchObj.microorganismBatchFileResultList"
              :pagination="false"
            >
              <template slot="title" slot-scope="currentPageData">
                <w-button icon="plus" size="small" @click="addMicroorganism()">
                  添加微生物
                </w-button>
                <w-button
                  type="primary"
                  size="small"
                  style="margin-left: 10px;"
                  @click="saveResult"
                >
                  保存识别结果
                </w-button>
              </template>
              <template slot="atlasName" slot-scope="text, record">
                <w-select
                  v-model="record.atlasId"
                  style="width: 120px"
                  size="small"
                  @change="changeBiology(record)"
                >
                  <w-select-option
                    v-for="i of filteredBiologyList(record)"
                    :key="i.id"
                    :value="i.id"
                  >
                    {{ i.name }}
                  </w-select-option>
                </w-select>
              </template>
              <template slot="count" slot-scope="text, record">
                <w-input-number disabled v-model="record.count" id="inputNumber" size="small" />
              </template>
              <template slot="accuracyRate" slot-scope="text, record">
                <a-input-number
                  v-model="record.accuracyRate"
                  :min="0"
                  :max="100"
                  :formatter="value => `${value}%`"
                  :parser="value => value.replace('%', '')"
                />
              </template>
              <template slot="operation" slot-scope="text, record">
                <a @click="delMicroorganism(record)">删除</a>
              </template>
            </w-table>
          </div>
        </div>
      </div>
    </div>
    <div class="img-modal" v-if="imgVisible">
      <div class="modal-h">
        <a> <a-icon type="close" @click="imgVisible = false"/></a>
      </div>
      <img style="width: 100%" :src="previewImgUrl" />
    </div>
  </div>
</template>

<script>
import { addSaveBatch, getPage, editResult } from '@/api/biologyAtlas';
import uuid from '@/utils/uuid';
import { sysDictListByCode, getStructureByStationId } from '@/api/deviceManagement';
import uploadImg from './components/uploadImg';
import serverConfig from '@/config/server.config';
import moment from 'moment';
export default {
  name: 'BiologyAtlas',
  components: { uploadImg },
  mixins: [],
  props: {
    isDiscern: {
      type: Boolean,
      default: false
    },
    discernObj: {
      type: Object,
      default: () => {}
    },
    eyepieceData: {
      type: Array,
      default: () => []
    },
    objectiveLensData: {
      type: Array,
      default: () => []
    },
    fileTypeData: {
      type: Array,
      default: () => []
    },
    statusData: {
      type: Array,
      default: () => []
    },
    // samplLocation: {
    //   type: Array,
    //   default: () => []
    // },
    factoryList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      columns: [
        {
          title: '序号',
          dataIndex: 'num',
          key: 'num',
          align: 'center',
          width: 80,
          customRender: (text, row, index) => {
            return index + 1;
          }
        },
        {
          title: '微生物',
          dataIndex: 'atlasName',
          key: 'atlasName',
          scopedSlots: { customRender: 'atlasName' }
        },
        {
          title: '数量',
          dataIndex: 'count',
          key: 'count',
          scopedSlots: { customRender: 'count' }
        },
        {
          title: '准确率',
          dataIndex: 'accuracyRate',
          key: 'accuracyRate',
          scopedSlots: { customRender: 'accuracyRate' }
        },
        {
          title: '操作',
          dataIndex: 'operation',
          key: 'operation',
          width: 60,
          scopedSlots: { customRender: 'operation' }
        }
      ],
      imgVisible: false,
      previewImgUrl: '',
      current: 1,
      pageSize: 20,
      total: 0,
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      fileList: [],
      show: false,
      addForm: {
        batchName: '',
        fileType: '',
        status: '',
        objectiveLens: '',
        waterPlantId: '',
        sampleTime: moment(),
        sampleLocation: '',
        eyepiece: ''
      },
      tableData: [],
      atlasId: '',

      rules: {
        waterPlantId: [{ required: true, message: '请选择污水厂', trigger: 'change' }],
        sampleTime: [{ required: true, message: '请选择取样时间', trigger: 'change' }],
        fileType: [{ required: true, message: '请选择文件类型', trigger: 'change' }],
        sampleLocation: [{ required: true, message: '请选择取样位置', trigger: 'change' }],

        eyepiece: [{ required: true, message: '请选择目镜', trigger: 'change' }],
        objectiveLens: [{ required: true, message: '请选择物镜', trigger: 'change' }],
        status: [{ required: true, message: '请选择识别状态', trigger: 'change' }]
      },
      dictionaries: [
        {
          type: 'purification_microorganism_eyepiece',
          name: 'eyepiece'
        },
        {
          type: 'purification_microorganism_objectiveLens',
          name: 'objectiveLens'
        },
        {
          type: 'purification_microorganism_file_type',
          name: 'fileType'
        },
        {
          type: 'purification_microorganism_status',
          name: 'status'
        }
      ],
      previewBaseUrl: serverConfig.PUBLIC_API_BASE_URL + '/userCenterApi/FileManager/download/',
      discernObjCopy: {
        batchName: '',
        fileType: '',
        status: '',
        objectiveLens: '',
        waterPlantId: '',
        sampleTime: '',
        sampleLocation: '',
        eyepiece: ''
      },
      biologyList: [],
      samplLocation: [],
      editBatchObj: {
        microorganismBatchFileResultList: []
      },
      imgIndex: 0
    };
  },
  computed: {
    // 过滤已选中的微生物选项
    filteredBiologyList() {
      return currentRecord => {
        if (!this.editBatchObj.microorganismBatchFileResultList) {
          return this.biologyList;
        }

        // 获取已选中的atlasId列表（排除当前行）
        const selectedIds = this.editBatchObj.microorganismBatchFileResultList
          .filter(item => item.atlasId && item.atlasId !== '' && item.uuid !== currentRecord.uuid)
          .map(item => item.atlasId);

        // 返回未选中的选项
        return this.biologyList.filter(item => !selectedIds.includes(item.id));
      };
    }
  },
  watch: {
    'addForm.waterPlantId'() {
      this.addForm.sampleLocation = '';
      this.getStructureByStationId();
    },
    fileList(val) {
      console.log(val);
    }
  },
  activated() {},
  async created() {
    // await this.getSysDictListByCode();
    await this.getStructureByStationId();
    // await this.getFactoryList();
    await this.getPageData();
    this.fileList = [];
    if (this.discernObj && this.isDiscern) {
      this.$nextTick(() => {
        this.discernObjCopy = this.discernObj;
        this.fileList = this.discernObj.microorganismBatchFileList.map((item, index) => {
          return {
            fileUrl: this.handleImgSrc(item.fileId),
            fileId: item.fileId,
            fileName: item.fileName,
            batchId: item.batchId,
            fileType: item.fileType,
            id: item.id,
            microorganismBatchFileResultList: item.microorganismBatchFileResultList,
            status: item.status,
            name: '样本' + (index + 1)
          };
        });
        this.editBatchObj = {
          ...this.fileList[0]
        };
      });
    }
  },
  methods: {
    getPageData() {
      let params = {
        current: 1,
        pageSize: 9999
      };
      getPage(params).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          this.biologyList = resultData.records;
        }
      });
    },
    filterParams(val, list) {
      if (list.length && val !== '') {
        let obj = list?.find(item => val == item.dictValue);
        return obj.dictName;
      } else {
        return val;
      }
    },
    changeWater(value) {
      this.factoryList.forEach(item => {
        if (item.pumpId === value) {
          this.addForm.batchName = item.stationName;
        }
      });
    },
    saveBatch() {
      this.$refs.ruleForm.validate(valid => {
        if (this.fileList.length < 1) {
          this.$message.warning('请先上传识别文件！');
          return;
        }
        let fileList = this.fileList.map(item => {
          return {
            fileId: item.fileId,
            fileName: item.fileName,
            fileType: item.fileType
          };
        });
        if (valid) {
          let params = {
            ...this.addForm,
            sampleTime: moment(this.addForm.sampleTime).format('YYYY-MM-DD HH:mm:ss'),
            microorganismBatchFileList: fileList
          };
          addSaveBatch(params).then(res => {
            if (res.status === 'complete') {
              this.$message.success('保存批次成功！');
              this.getBack();
            }
          });
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    getBack() {
      this.fileList = [];
      this.addForm = {
        batchName: '',
        fileType: '',
        status: '',
        objectiveLens: '',
        waterPlantId: '',
        sampleTime: moment(),
        sampleLocation: '',
        eyepiece: ''
      };
      this.$refs.ruleForm && this.$refs.ruleForm.resetFields();
      this.$emit('getBack');
    },
    getSysDictListByCode() {
      this.dictionaries.forEach(async item => {
        const { resultData } = await sysDictListByCode(item.type);
        this[item.name + 'Data'] = resultData;
      });
    },
    // 获取安装地址（构筑物、仓库）
    async getStructureByStationId() {
      let params = {
        waterPlantId: this.addForm.waterPlantId ? this.addForm.waterPlantId : ''
      };
      const { resultData } = await getStructureByStationId(params);
      let data = resultData.map(item => {
        return {
          dictCode: item.name,
          dictValue: item.id,
          dictName: item.name,
          ...item
        };
      });
      this.samplLocation = data;
    },
    async getFactoryList() {
      const { resultData } = await this.$http.post('waterPlantClient/getWaterPlants');
      this.factoryList = resultData;
    },
    mouseenter() {
      this.show = true;
    },
    mouseleave() {
      this.show = false;
    },
    closeImg(row) {
      this.$refs.uploadImg.handleClose(row);
    },
    emptyStock() {
      this.fileList.forEach(item => {
        this.$refs.uploadImg.handleClose(item);
      });
    },
    enlargement(row, index) {
      this.previewImgUrl = row.fileUrl;
      this.imgVisible = true;
      if (index) {
        this.editBatchObj = {
          ...this.fileList[index - 1]
        };
        this.imgIndex = index - 1;
      }
    },
    handleImgSrc(fileId) {
      if (fileId) {
        console.log(this.previewBaseUrl + fileId);
        return this.previewBaseUrl + fileId;
      }
      return '';
    },
    addMicroorganism() {
      let obj = {
        atlasName: '',
        count: 1,
        atlasId: '',
        accuracyRate: '',
        batchId: this.editBatchObj.batchId,
        fileId: this.editBatchObj.id,
        uuid: uuid()
      };
      this.editBatchObj.microorganismBatchFileResultList.push(obj);
    },
    delMicroorganism(row) {
      this.editBatchObj.microorganismBatchFileResultList = this.editBatchObj.microorganismBatchFileResultList.filter(
        item => item.id !== row.id
      );
    },
    changeBiology(row) {
      let name = '';
      this.biologyList.forEach(i => {
        if (i.id === row.atlasId) {
          name = i.name;
        }
      });

      this.editBatchObj.microorganismBatchFileResultList.forEach(item => {
        if (item.uuid === row.uuid) {
          item.atlasName = name;
        }
      });
    },
    saveResult() {
      let params = {
        batchId: this.editBatchObj.batchId,
        fileId: this.editBatchObj.fileId,
        fileName: this.editBatchObj.fileName,
        fileType: this.editBatchObj.fileType,
        id: this.editBatchObj.id,
        microorganismBatchFileResultList: this.editBatchObj.microorganismBatchFileResultList
      };
      editResult(params).then(res => {
        if (res.status === 'complete') {
          this.$message.success('保存识别结果成功！');
          this.fileList.forEach(item => {
            if (item.id === this.editBatchObj.id) {
              item.status = 2;
            }
          });
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.addBatchQuery {
  height: 100%;
  width: 100%;
  position: relative;
  /* padding: 10px; */
  .addBatchQuery-head {
    width: 100%;
    min-height: 60px;
    background-color: var(--supply-color-bg-card-DEFAULT);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px;
    .text {
      font-size: 18px;
    }
  }
  .addBatchQuery-central {
    margin-top: 10px;
    height: calc(100% - 70px);
    width: 100%;
    background-color: var(--supply-color-bg-card-DEFAULT);
    border-radius: 4px;
    padding: 12px 12px;
    overflow: auto;
    .ruleForm {
      display: flex;
      flex-wrap: wrap;
    }
    /deep/.wpg-form-item-label {
      width: 120px;
      text-align: right;
    }
    .central-h {
      width: 100%;
      /* margin-bottom: 20px; */
      height: 170px;
      overflow: auto;
    }
    .central-c {
      padding: 0 20px;
      height: calc(100% - 200px);
      min-height: 500px;
      width: 100%;
      .title-box {
        margin-bottom: 10px;
        /* display: flex; */
        /* justify-content: space-between; */
        .upload-box {
          width: 150px;
          height: 20px;
          overflow: hidden;
          margin-left: 38%;
          display: flex;
          justify-content: space-between;
        }
        .centralText {
          margin-left: 47%;
        }
      }
      .central-box {
        height: 95%;
        width: 100%;
        display: flex;
        justify-content: space-between;
        .central-r {
          height: 100%;
          width: 49.5%;
          border: 1px dashed #d6d6d6;
          padding: 14px;
          overflow: auto;
        }
        .central-l {
          height: 100%;
          width: 49.5%;
          border: 1px dashed #d6d6d6;
          padding: 14px;
          display: flex;
          flex-wrap: wrap;
          align-content: flex-start;
          .img-box1 {
            border: 1px solid #ff0033 !important;
          }
          .img-box {
            width: 130px;
            height: 140px;
            position: relative;
            border: 1px solid #d6d6d6;
            border-radius: 2px;
            margin: 0 12px 25px 0;
            .authenticated {
              position: absolute;
              top: 0;
              right: 0;
              color: white;
              font-weight: 700;

              width: 0;
              height: 0;
              border-style: solid;
              border-width: 0 25px 25px 0;
              border-color: transparent #ff0033 transparent transparent;
              .icon {
                position: absolute;
                top: 0;
                right: -27px;
              }
            }
            img {
              height: 100%;
              width: 100%;
            }
            .img-text {
              width: 100%;
              text-align: center;
            }
            .close {
              cursor: pointer;
              position: absolute;
              bottom: 50px;
              left: 0px;
              width: 100%;
              height: 40px;
              font-size: 24px;
              text-align: center;
              z-index: 10;
              a {
                pointer-events: none;
                line-height: 40px;
              }
            }
            .close-l {
              cursor: pointer;
              position: absolute;
              bottom: 50px;
              left: 0px;
              width: 50%;
              height: 40px;
              font-size: 24px;
              text-align: center;
              /* font-size: 30px; */
              /* backdrop-filter: blur(20px); */
              /* background-color: rgba(255, 255, 255, 0.5); */
              /* pointer-events: none; */
              z-index: 10;
              a {
                pointer-events: none;
                line-height: 40px;
              }
            }
            .close-r {
              cursor: pointer;
              position: absolute;
              bottom: 50px;
              right: 0px;
              width: 50%;
              height: 40px;
              font-size: 24px;
              text-align: center;
              /* font-size: 30px; */
              /* backdrop-filter: blur(20px); */
              /* background-color: rgba(255, 255, 255, 0.5); */
              /* pointer-events: none; */
              z-index: 10;
              a {
                pointer-events: none;
                line-height: 40px;
              }
            }
          }
        }
      }
    }
  }
  .img-modal {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 10;
    width: 860px;
    height: 840px;
    padding: 10px;
    border: 1px solid var(--supply-color-border-DEFAULT);
    .modal-h {
      width: 100%;
      height: 20px;
      display: flex;
      justify-content: flex-end;
      background-color: var(--supply-color-bg-card-DEFAULT);
    }
  }
}
/deep/.wpg-upload-select-picture-card {
  width: 100px !important;
  height: 16px !important;
  overflow: hidden;
}
</style>
