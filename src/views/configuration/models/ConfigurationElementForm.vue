<template>
  <div class="element-form">
    <div class="element-form-text">
      <!-- 属性设置 -->
      <w-row v-show="type !== 'com'" class="bar">
        <div v-show="type === 'text'" class="demo-input-suffix">
          <span class="label-dia">文本类型:</span>
          <w-select
            :disabled="disabled"
            v-model="textOption.optionsValue"
            placeholder="请选择文本类型"
            style="width:200px"
          >
            <w-select-option
              v-for="item in textOption.options"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </w-select-option>
          </w-select>
        </div>

        <div
          v-show="textOption.optionsValue !== '3' && (type === 'img' || type === 'text')"
          class="demo-input-suffix"
        >
          <span class="label-dia">事件:</span>
          <w-select :disabled="disabled" v-model="eventValue" style="width:200px">
            <w-select-option v-for="item in callBackEvent" :key="item.value" :value="item.value">
              {{ item.label }}
            </w-select-option>
          </w-select>
        </div>

        <div
          v-show="eventValue !== '1' && type !== 'point' && type !== 'alarm'"
          class="demo-input-suffix"
        >
          <span class="label-dia">事件类型:</span>
          <w-select :disabled="disabled" v-model="eventType" style="width:200px">
            <w-select-option value="">默认</w-select-option>
            <w-select-option value="video">视频</w-select-option>
          </w-select>
        </div>

        <div v-show="eventValue !== '1' && eventType === 'video'" class="demo-input-suffix">
          <span class="label-dia">选择视频:</span>
          <!-- 模板 -->
          <w-select
            v-if="!waterPlantId"
            @change="selectOriginVideo"
            v-model="svgElement.videoOriginCode"
            style="width:200px"
          >
            <w-select-option
              v-for="item in textOption.videoList"
              :key="item.videoId"
              :value="item.videoId"
            >
              {{ item.videoName }}
            </w-select-option>
          </w-select>
          <w-select
            v-else
            @change="selectOriginVideo"
            v-model="svgElement.videoCode"
            style="width:200px"
          >
            <w-select-option
              v-for="item in textOption.videoList"
              :key="item.videoId"
              :value="item.videoId"
            >
              {{ item.videoName }}
            </w-select-option>
          </w-select>
        </div>

        <!-- 文本内容 -->
        <div
          v-show="
            type === 'text' && (textOption.optionsValue === '1' || textOption.optionsValue === '3')
          "
          class="demo-input-suffix demo-input-w"
        >
          <span class="label-dia">文本内容:</span>
          <w-input
            :disabled="disabled"
            v-model="svgElement.value"
            placeholder="请输入内容"
            size="small"
          >
          </w-input>
        </div>

        <!-- 文本大小 -->
        <div v-show="type === 'text'" class="demo-input-suffix demo-input-w">
          <span class="label-dia">字体大小:</span>
          <w-input
            :disabled="disabled"
            v-model="svgElement.fontSize"
            placeholder="请输入字体大小"
            size="small"
            type="number"
          >
          </w-input>
        </div>

        <!-- 关联对象 -->
        <div
          v-show="
            eventType !== 'video' &&
              (textOption.optionsValue === '2' ||
                type === 'img' ||
                type === 'rect' ||
                type === 'text' ||
                type === 'point' ||
                type === 'alarm' ||
                type === 'line')
          "
          class="demo-input-suffix"
        >
          <span class="label-dia">关联对象:</span>
          <w-select
            :disabled="disabled"
            v-model="textOption.options2Value"
            placeholder="请选择关联对象"
            style="width:200px"
          >
            <w-select-option
              v-for="item in textOption.options2"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </w-select-option>
          </w-select>
        </div>

        <!-- 关联设备 -->
        <div
          v-show="
            (textOption.optionsValue === '2' ||
              type === 'img' ||
              type === 'rect' ||
              type === 'point' ||
              type === 'text' ||
              type === 'alarm' ||
              type === 'line') &&
              textOption.options2Value !== '0' &&
              eventType !== 'video'
          "
          class="demo-input-suffix"
        >
          <span class="label-dia">关联设备:</span>
          <!-- 模板 -->
          <w-select
            v-if="!waterPlantId"
            v-model="textOption.optionsDeviceValue"
            placeholder="请选择关联设备"
            style="width:200px"
            @select="
              value => {
                getPoint(value);
              }
            "
          >
            <w-select-option
              v-for="item in textOption.optionsDevice"
              :key="item.deviceId"
              :value="item.deviceId"
            >
              {{ item.deviceName }}
            </w-select-option>
          </w-select>
          <w-select
            v-else
            v-model="svgElement.deviceId"
            placeholder="请选择关联设备"
            @change="deviceChange"
            style="width:200px"
            @select="
              value => {
                getPoint(value);
              }
            "
          >
            <w-select-option
              v-for="item in textOption.optionsDevice"
              :key="item.deviceId"
              :value="item.deviceId"
            >
              {{ item.deviceName }}
            </w-select-option>
          </w-select>
        </div>

        <!-- 关联监测量 -->
        <div
          v-show="
            !(svgElement.objectType && type === 'img') &&
              (textOption.optionsValue === '2' ||
                type === 'img' ||
                type === 'rect' ||
                type === 'point' ||
                type === 'alarm' ||
                type === 'line') &&
              textOption.options2Value !== '0' &&
              eventType !== 'video'
          "
          style="position: relative;white-space: nowrap;"
          class="demo-input-suffix demo-input-w"
        >
          <span class="label-dia">关联监测量:</span>
          <w-input
            :disabled="disabled"
            style="width: 274px"
            v-model="svgElement.codeElementObj.relationPoint"
            placeholder="请选择关联监测量"
            size="small"
          >
          </w-input>
          <w-icon
            v-if="!disabled"
            style="
                  position: absolute;
                  top: 2px;
                  right: 110px;
                  z-index: 999;
                  padding: 5px;
                  font-size: 16px;
                "
            type="down"
            @click="choosePoint('')"
          />
          <w-icon
            v-if="!disabled"
            v-show="svgElement.codeElementObj.relationPoint"
            type="delete"
            class="supply-ml-1"
            @click="deleteRelationPoint"
          />
        </div>
        <!-- 修改关联监测量code -->
        <div
          v-show="
            !(svgElement.objectType && type === 'img') &&
              svgElement.codeElementObj.relationPoint &&
              textOption.optionsValue !== '3' &&
              eventType !== 'video'
          "
          class="demo-input-suffix demo-input-w"
        >
          <span class="label-dia">监测量:</span>
          <w-input :disabled="disabled" v-model="svgElement.codeElementObj.codeId" size="small">
          </w-input>
          <w-icon
            v-if="!disabled"
            v-show="svgElement.codeElementObj.relationPoint && type === 'point'"
            type="plus"
            class="supply-ml-2"
            @click="addRelationPoint"
          />
        </div>

        <!-- 修改关联监测量单位 -->
        <div
          v-show="
            !(svgElement.objectType && type === 'img') &&
              (textOption.optionsValue === '2' ||
                type === 'img' ||
                type === 'rect' ||
                type === 'point' ||
                type === 'alarm' ||
                type === 'line') &&
              textOption.options2Value !== '0' &&
              eventType !== 'video'
          "
          class="demo-input-suffix demo-input-w"
        >
          <span class="label-dia">单位:</span>
          <w-input
            :disabled="disabled"
            v-model="svgElement.codeElementObj.pointUnit"
            placeholder="请输入单位"
            size="small"
          >
          </w-input>
        </div>
        <!-- 是否下控 -->
        <div v-show="type === 'point'" class="demo-input-suffix">
          <span class="label-dia">是否下控:</span>
          <w-select
            :disabled="disabled"
            v-model="svgElement.isControl"
            placeholder="请选择是否下控"
            style="width:200px"
          >
            <w-select-option value="1">是</w-select-option>
            <w-select-option value="0">否</w-select-option>
          </w-select>
        </div>
        <div
          v-show="eventType !== 'video' && (type === 'img' || type === 'point')"
          class="demo-input-suffix"
        >
          <span class="label-dia">元素类型:</span>
          <w-select
            :disabled="disabled"
            allowClear
            placeholder="请选择元素类型"
            @change="objectTypeChange"
            v-model="svgElement.objectType"
            style="width:200px"
          >
            <w-select-option v-for="item in objectTypeList" :key="item.value" :value="item.value">
              {{ item.label }}
            </w-select-option>
          </w-select>
        </div>
        <div class="demo-input-suffix" v-show="svgElement.objectType">
          <span class="label-dia">关联{{ objectTypeTitle }}:</span>
          <w-select
            :disabled="disabled"
            allowClear
            :placeholder="`请选择关联${objectTypeTitle}`"
            v-model="svgElement.svgObjectValue"
            style="width:200px"
          >
            <w-select-option v-for="item in objectOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </w-select-option>
          </w-select>
        </div>
        <div
          class="demo-input-suffix supply-flex"
          v-show="svgElement.objectType && type !== 'point'"
        >
          <span class="label-dia">状态配置:</span>
          <point-status
            :disabled="disabled"
            style="width: calc(100% - 80px)"
            v-model="svgElement.pointStatusList"
          ></point-status>
        </div>
        <div class="demo-input-suffix" v-show="svgElement.objectType">
          <span class="label-dia">控制监测量:</span>
          <virtual-tree
            :disabled="disabled"
            v-model="svgElement.controlPoints"
            :renderAmount="50"
            class="point-tree"
            :sortSelect="true"
            show-checkbox
            style="width: calc(100% - 80px)"
            :maxTagCount="50"
            nodeKey="pointName"
            :treeData="pointOptions"
            :replaceFields="{ label: 'pointMemo', children: 'children' }"
            allowClear
            showSearch
            size="small"
          >
          </virtual-tree>
        </div>
        <div class="demo-input-suffix" v-show="svgElement.objectType">
          <span class="label-dia">信息监测量:</span>
          <virtual-tree
            :disabled="disabled"
            :sortSelect="true"
            v-model="svgElement.infoPoints"
            :renderAmount="50"
            class="point-tree"
            show-checkbox
            style="width: calc(100% - 80px)"
            :maxTagCount="50"
            nodeKey="pointName"
            :treeData="pointOptions"
            :replaceFields="{ label: 'pointMemo', children: 'children' }"
            allowClear
            showSearch
            size="small"
          >
          </virtual-tree>
        </div>

        <div v-show="type === 'alarm'" class="demo-input-suffix">
          <span class="label-dia">报警名称:</span>
          <w-input
            :disabled="disabled"
            v-model="svgElement.alarmName"
            placeholder="请输入报警名称"
            size="small"
          >
          </w-input>
        </div>
        <div class="demo-input-suffix" v-show="type === 'point'">
          <span class="label-dia">长度:</span>
          <w-select
            :disabled="disabled"
            v-model="svgElement.bgWidth"
            placeholder="请选择长度"
            style="width:200px"
          >
            <w-select-option value="251">251</w-select-option>
            <w-select-option value="302">302</w-select-option>
            <w-select-option value="custom">自定义</w-select-option>
          </w-select>
          <w-input-number
            v-if="svgElement.bgWidth == 'custom'"
            v-model="svgElement.customWidth"
            style="width:120px;margin-left:12px"
          ></w-input-number>
        </div>

        <!-- 图片是否下控 -->
        <div
          v-show="
            type === 'img' &&
              svgElement.codeElementObj.dataType === 'bool' &&
              !svgElement.objectType
          "
          class="demo-input-suffix"
        >
          <span class="label-dia">是否下控:</span>
          <w-select
            :disabled="disabled"
            v-model="svgElement.imgControl"
            placeholder="请选择是否下控"
            style="width:200px"
          >
            <w-select-option value="1">是</w-select-option>
            <w-select-option value="0">否</w-select-option>
          </w-select>
        </div>

        <!-- 显示控制 -->
        <!-- <div class="demo-input-suffix">
          <span class="label-dia">显示控制:</span>
          <w-select v-model="svgElement.displayControl" placeholder="请选择显示控制" style="width:200px">
            <w-select-option v-for="item in displayControlList" :key="item.id" :value="item.id">{{ item.label }}</w-select-option>
          </w-select>
        </div> -->

        <!-- 显示控制 -->
        <!-- <div class="demo-input-suffix" v-show="type === 'point'">
          <span class="label-dia">定制测点:</span>
          <w-select v-model="svgElement.onlyCustom" placeholder="请选择定制测点" style="width:200px">
            <w-select-option value="1">是</w-select-option>
            <w-select-option value="0">否</w-select-option>
          </w-select>
        </div> -->

        <template
          v-if="
            textOption.optionsValue !== '3' &&
              type !== 'alarm' &&
              type !== 'point' &&
              !svgElement.objectType
          "
        >
          <!--处理方式-->
          <div
            v-show="textOption.options2Value != 0 && svgElement.codeElementObj.relationPoint"
            class="demo-input-suffix"
          >
            <span class="label-dia">处理类型:</span>
            <w-select
              :disabled="disabled"
              v-model="svgElement.codeElementObj.dealType"
              placeholder="请选择处理类型"
              style="width:200px;"
            >
              <w-select-option value="0">
                替换值
              </w-select-option>
              <w-select-option value="1">
                替换图片
              </w-select-option>
              <w-select-option value="2">
                修改元素高度
              </w-select-option>
            </w-select>
          </div>

          <!-- 最大值最小值回显和修改 -->
          <div class="demo-input-suffix X-Y-axis">
            <span
              v-show="svgElement.codeElementObj.relationPoint"
              style="vertical-align: middle;"
              class="label-dia"
              >{{ stateOrNumber[stateOrNumberStaus][0] }}({{
                svgElement.codeElementObj.pointUnit
              }}):</span
            >
            <w-input
              :disabled="disabled"
              v-show="svgElement.codeElementObj.relationPoint"
              v-model="svgElement.codeElementObj.minValue"
              placeholder="请输入最小值"
              size="small"
              type="number"
              style="vertical-align: middle;"
            >
            </w-input>
            <span
              v-show="svgElement.codeElementObj.relationPoint"
              style="vertical-align: middle;"
              class="label-dia marginl10"
              >{{ stateOrNumber[stateOrNumberStaus][1] }}({{
                svgElement.codeElementObj.pointUnit
              }}):</span
            >
            <w-input
              :disabled="disabled"
              v-show="svgElement.codeElementObj.relationPoint"
              v-model="svgElement.codeElementObj.maxValue"
              placeholder="请输入最大值"
              size="small"
              type="number"
              style="vertical-align: middle;"
            >
            </w-input>
          </div>

          <!-- 最大值和最小值时显示的图片  -->
          <div
            v-show="
              (type === 'img' || type === 'text' || type === 'point') &&
                svgElement.codeElementObj.dealType == 1
            "
            class="demo-input-suffix X-Y-axis"
          >
            <span v-show="svgElement.codeElementObj.relationPoint" class="label-dia"
              >{{ stateOrNumber[stateOrNumberStaus][2] }}:</span
            >
            <div
              v-show="svgElement.codeElementObj.relationPoint"
              style="
                  display: inline-block;
                  width: 50px;
                  height: 50px;
                  line-height: 50px;
                  text-align: center;
                  vertical-align: middle;
                  border: 1px #ccc dotted;
                "
              @click="chooseValueImg($event, 'min')"
            >
              <w-popover placement="right" width="100" trigger="hover">
                <img
                  :src="svgElement.codeElementObj.minImgUrl"
                  class="choose-value-img"
                  style=" max-width: 50px;max-height: 50px;object-fit: contain;"
                />
                <img
                  slot="content"
                  :src="svgElement.codeElementObj.minImgUrl"
                  class="choose-value-img"
                  style=" max-width: 100px;max-height: 100px;object-fit: contain;"
                />
              </w-popover>
            </div>
            <span
              v-show="svgElement.codeElementObj.relationPoint"
              class="label-dia"
              style="margin-left: 38px;"
              >{{ stateOrNumber[stateOrNumberStaus][3] }}:</span
            >
            <div
              v-show="svgElement.codeElementObj.relationPoint"
              style="
                  display: inline-block;
                  width: 50px;
                  height: 50px;
                  line-height: 50px;
                  text-align: center;
                  vertical-align: middle;
                  border: 1px #ccc dotted;
                "
              @click="chooseValueImg($event, 'max')"
            >
              <w-popover placement="right" width="100" trigger="hover">
                <img
                  :src="svgElement.codeElementObj.maxImgUrl"
                  class="choose-value-img"
                  style=" max-width: 50px;max-height: 50px;object-fit: contain;"
                />
                <img
                  slot="content"
                  :src="svgElement.codeElementObj.maxImgUrl"
                  class="choose-value-img"
                  style=" max-width: 100px;max-height: 100px;object-fit: contain;"
                />
              </w-popover>
            </div>
          </div>
        </template>
        <div
          v-show="svgElement.axisX && (type === 'point' || type === 'alarm' || type === 'img')"
          class="demo-input-suffix X-Y-axis"
        >
          <span class="label-dia">x轴(px)</span>
          <w-input
            :disabled="disabled"
            v-model="svgElement.axisX"
            placeholder="请输入X轴"
            size="small"
            type="number"
          >
          </w-input>
          <span class="label-dia marginl10">Y轴(px)</span>
          <w-input
            :disabled="disabled"
            v-model="svgElement.axisY"
            placeholder="请输入Y轴"
            size="small"
            type="number"
          >
          </w-input>
        </div>
        <div
          v-show="type !== 'img' && type !== 'alarm' && type !== 'line'"
          class="demo-input-suffix"
        >
          <span class="label-dia">{{ type === 'point' ? '背景' : '' }}颜色:</span>
          <w-input
            :disabled="disabled"
            v-model="svgElement.fill"
            placeholder="请输入颜色"
            size="small"
            style="width: 57%;"
            class="marginr10"
          >
          </w-input>

          <w-popover :class="{ 'tag--disabled': disabled }" trigger="click">
            <template slot="content">
              <sketch-picker
                :disabled="disabled"
                v-model="svgElement.fill"
                :preset-colors="switchColors"
                @input="updateValue"
              >
              </sketch-picker>
            </template>
            <span class="color-picker__trigger">
              <w-icon type="down-square" theme="filled" :style="{ color: svgElement.fill }" />
            </span>
          </w-popover>
        </div>

        <div v-show="type === 'line'" class="demo-input-suffix">
          <span class="label-dia">颜色:</span>
          <w-input
            :disabled="disabled"
            v-model="svgElement.stroke"
            placeholder="请输入颜色"
            size="small"
            style="width: 57%;"
            class="marginr10"
          >
          </w-input>

          <w-popover :class="{ 'tag--disabled': disabled }" trigger="click">
            <template slot="content">
              <sketch-picker
                :disabled="disabled"
                v-model="svgElement.stroke"
                :preset-colors="switchColors"
                @input="updateValue"
              >
              </sketch-picker>
            </template>
            <span class="color-picker__trigger">
              <w-icon type="down-square" theme="filled" :style="{ color: svgElement.stroke }" />
            </span>
          </w-popover>
        </div>

        <div v-show="type === 'line'" class="demo-input-suffix X-Y-axis">
          <span class="label-dia">线宽</span>
          <w-input
            :disabled="disabled"
            v-model="svgElement.strokeWith"
            placeholder="请输入线宽"
            size="small"
            type="number"
          >
          </w-input>
        </div>

        <div v-show="type === 'line'" class="demo-input-suffix">
          <span class="label-dia">动画</span>
          <w-select :disabled="disabled" v-model="svgElement.animate" placeholder="请选择动画">
            <w-select-option value="1">有</w-select-option>
            <w-select-option value="0">无</w-select-option>
          </w-select>
        </div>

        <div
          v-show="
            eventValue == '2' &&
              ((!waterPlantId && textOption.optionsDeviceValue) ||
                (waterPlantId && svgElement.deviceId))
          "
          class="demo-input-suffix X-Y-axis"
        >
          <span class="label-dia">悬浮关联监测量数量</span>
          <w-input
            :disabled="disabled"
            v-model="svgElement.hoverCodeNum"
            placeholder="请输入数量"
            size="small"
            type="number"
            :max="10"
            :min="0"
          >
          </w-input>
          <span style="color: #ccc;">（只能输入0～10）</span>
        </div>

        <!-- 悬浮关联监测量 -->
        <div
          v-show="
            eventValue == '2' &&
              svgElement.hoverCodeNum > 0 &&
              ((!waterPlantId && textOption.optionsDeviceValue) ||
                (waterPlantId && svgElement.deviceId))
          "
        >
          <div
            v-for="(item, index) in svgElement.hoverCodeList"
            :key="item.codeId"
            class="demo-input-suffix demo-input-w"
          >
            <span class="label-dia">监测量{{ index + 1 }}:</span>
            <w-input
              :disabled="disabled"
              placeholder="请选择监测量"
              size="small"
              :value="item.relationPoint"
              @click="choosePoint(index + 1)"
            >
            </w-input>
          </div>
        </div>
      </w-row>
      <w-row v-show="type === 'com'" class="bar">
        <w-col v-show="isArea" span="5">
          <span>巡检设备区位</span>
        </w-col>
        <w-col v-show="isArea" span="19">
          <w-select
            :disabled="disabled"
            v-model="svgElement.devInfo"
            label-in-value
            placeholder="请选择区位"
            style="width:100%"
            @change="devInfoChange"
          >
            <w-select-option v-for="item in devList" :key="item.deviceId" :value="item.deviceId">
              {{ item.deviceName }}
            </w-select-option>
          </w-select>
        </w-col>
        <w-col span="5">
          <span>巡检项</span>
        </w-col>
        <w-col span="19">
          <w-tree-select
            :disabled="disabled"
            v-model="svgElement.inspectionItem"
            style="width: 100%"
            :tree-data="areaList"
            :replaceFields="replaceFields"
            :labelInValue="true"
            :maxTagCount="1"
            tree-checkable
          />
        </w-col>
        <w-col span="5" v-show="selectVideo">巡检视频</w-col>
        <w-col span="19" v-show="selectVideo">
          <w-select
            :disabled="disabled"
            v-model="svgElement.videos"
            mode="multiple"
            placeholder="请选择视频"
            style="width: 100%"
            :maxTagCount="1"
            class="video-select"
          >
            <w-select-option v-for="item in videoList" :key="item.id" :value="item.id">{{
              item.videoName
            }}</w-select-option>
          </w-select>
        </w-col>
        <w-col span="5">巡检项时间(s)</w-col>
        <w-col span="19">
          <w-input-number
            :disabled="disabled"
            v-model="svgElement.inspTime"
            placeholder="请输入时间"
            :min="0"
          ></w-input-number>
        </w-col>
      </w-row>
    </div>
  </div>
</template>

<script>
import { Sketch } from 'vue-color';
import { cloneDeep } from 'lodash';
import VirtualTree from '@/components/Virtual/VirtualTreeSelect/index';
import { getlocationsByName } from '@/api/configuration';
import { InspConfigDetailList } from '@/api/manage';
import pointStatus from './pointStatus';
import { getElementTypeOptions, handleSvgElement } from './data';
export default {
  name: 'ConfigurationElementForm',
  inject: ['getPointOptions'],
  components: {
    VirtualTree,
    pointStatus,
    'sketch-picker': Sketch
  },

  props: {
    waterPlantId: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    objectTypeList: {
      type: Array,
      default: () => []
    },
    videoList: {
      type: Array,
      default: () => []
    },
    realDeviceData: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: 'text'
    },
    element: {
      type: Object,
      default: {}
    },
    imageElements: {
      type: Array,
      default: []
    },
    callBackEventValue: {
      type: String,
      default: ''
    },
    callBackEventType: {
      type: String,
      default: ''
    },
    textOption: {
      type: Object,
      default: {}
    },
    callBackEvent: {
      type: Array,
      default: []
    },
    stateOrNumberStaus: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      replaceFields: {
        title: 'inspectionName',
        value: 'value',
        key: 'id',
        children: 'child'
      },
      areaList: [],
      devList: [],
      multiple: false,
      isArea: false,
      svgElement: handleSvgElement(this.element),

      /* 图标绑定的状态展示语言 */
      stateOrNumber: {
        number: ['最小值', '最大值', '小值显示', '大值显示'],
        state: ['离线值', '在线值', '离线显示', '在线显示']
      },

      /* 默认快速可选颜色 */
      predefineColors: [
        '#ff4500',
        '#ff8c00',
        '#ffd700',
        '#90ee90',
        '#00ced1',
        '#1e90ff',
        '#c71585',
        'rgba(255, 69, 0, 0.68)',
        'rgb(255, 120, 0)',
        'hsv(51, 100, 98)',
        'hsva(120, 40, 94, 0.5)',
        'hsl(181, 100%, 37%)',
        'hsla(209, 100%, 56%, 0.73)',
        '#c7158577'
      ],
      id: '',
      eventValue: this.callBackEventValue,
      eventType: this.callBackEventType,
      inspectTypeList: ['视频', '数据', '报警'],
      displayControlList: [
        { id: '', label: '无' },
        { id: 'flowmeter', label: '进水流量计' },
        { id: 'tankLevel', label: '水箱液位' },
        { id: 'elevatorPump', label: '提升泵' },
        { id: 'regulationPump', label: '1#调峰泵' },
        { id: 'inletValve', label: '进水阀' },
        { id: 'No2inletValue', label: '2号进水阀' },
        { id: 'residualChlorine', label: '余氯仪' },
        { id: 'turbidity', label: '浊度仪' },
        { id: 'ultravioletDisinfection', label: '紫外消毒' },
        { id: 'blowdownPump', label: '排污泵' }
      ]
    };
  },

  computed: {
    objectTypeTitle() {
      return (
        this.objectTypeList.find(item => item.value === this.svgElement.objectType)?.label || ''
      );
    },
    selectVideo() {
      const arr = this.svgElement.inspectionItem.filter(item => item.label.includes('视频-'));
      return arr.length > 0 && this.waterPlantId;
    },
    objectOptions() {
      return getElementTypeOptions(this.objectTypeList, this.svgElement.objectType);
    },
    switchColors: function() {
      let arr = [];
      arr = this.predefineColors.map(item => {
        if (item.indexOf('hsv') != -1) {
          item = item.substring(item.indexOf('(') + 1, item.indexOf(')')).split(',');
          item = this.hsvToRgb(item);
          item = `rgba(${item[0]},${item[1]},${item[2]},${item[3]})`;
        }
        return item;
      });
      return arr;
    },
    pointOptions() {
      return this.getPointOptions();
    }
  },

  watch: {
    callBackEventValue(newVal) {
      this.eventValue = newVal;
    },
    callBackEventType(newVal) {
      this.eventType = newVal;
    },
    element: {
      immediate: true,
      handler: function(newVal) {
        if (newVal.comData) {
          this.id = newVal.comData.id;
          if (newVal.comData.configType === 1) {
            this.isArea = true;
            this.getlocationsByName(newVal.comData.stepName);
          } else {
            this.isArea = false;
          }
        }
        if (this.id) {
          this.getList(this.id, newVal);
        }
        this.$forceUpdate();
        this.svgElement = newVal;
      },
      deep: true
    },
    svgElement: {
      handler: function(newVal) {
        this.$emit('updateSvgElementAttributeNew', newVal);
      },
      deep: true
    },

    textOption: function(newEventValue, oldEventValue) {
      this.$forceUpdate();
      this.$emit('update:textOption', newEventValue);
    },

    /* 监听绑定鼠标事件 */
    eventValue: function(newEventValue, oldEventValue) {
      this.$emit('updataEventValue', newEventValue);
    },

    /* 监听绑定事件类型 */
    eventType: function(newEventValue, oldEventValue) {
      this.$emit('updataEventType', newEventValue);
    }
  },

  methods: {
    async getList(id, svgElement) {
      await InspConfigDetailList(id).then(res => {
        if (res.status === 'complete') {
          this.areaList = [];
          res.resultData.forEach(r => {
            if (r.delFlag === 0) {
              r.value = `${r.id}_${r.type}_${r.inspectionValue || 'null'}`;
              r.inspectionName = `${this.inspectTypeList[r.type]}-${r.inspectionName}`;
              this.areaList.push(r);
              // 更新已勾选的巡检项监测量
              if (svgElement) {
                let idx = svgElement.inspectionItem?.findIndex(
                  t => Number(t.value.split('_')[0]) === r.id
                );
                if (idx > -1) svgElement.inspectionItem[idx].value = r.value;
              }
            }
          });
        }
      });
    },
    deviceChange(val) {
      this.svgElement.deviceName = this.textOption.optionsDevice?.find(
        item => item.deviceId === val
      )?.deviceName;
    },
    objectTypeChange() {
      let curSvgObjectValue = this.objectOptions.find(
        item => item.value === this.svgElement.svgObjectValue
      );
      if (!curSvgObjectValue) {
        this.$set(this.svgElement, 'svgObjectValue', undefined);
      }
    },
    chooseStatusImg(status) {
      this.$emit('chooseValueImg', 'status', status);
    },
    getlocationsByName(name) {
      if (this.waterPlantId) {
        this.devList = this.realDeviceData;
      } else {
        getlocationsByName(name).then(res => {
          const list = res.resultData.map(item => {
            return {
              id: item.id,
              sort: item.sort,
              deviceId: item.locationCode,
              deviceName: item.locationName
            };
          });
          this.devList = list;
        });
      }
    },
    // 区位变化
    devInfoChange(event) {
      let deviceId = event.key;
      let name = event.label.trim();
      let id = this.devList.find(item => item.deviceId === deviceId)?.id;
      let sort = this.devList.find(item => item.deviceId === deviceId)?.sort;
      if (this.svgElement.comData) {
        // this.svgElement.comData.id = id;
        this.svgElement.comData.locationCode = deviceId;
        this.svgElement.comData.locationName = name;
        this.svgElement.comData.sort = sort;
        // this.getList(id);
        this.svgElement.inspectionItem = [];
      }
    },
    selectOriginVideo(val) {
      this.svgElement.videoCode = val;
    },
    // 更新颜色值
    updateValue(item) {
      this.svgElement.fill = `rgba(${item.rgba.r}, ${item.rgba.g}, ${item.rgba.b}, ${item.rgba.a})`;
      this.svgElement.stroke = `rgba(${item.rgba.r}, ${item.rgba.g}, ${item.rgba.b}, ${item.rgba.a})`;
    },

    // hsv转换成rgb
    hsvToRgb(arr) {
      let h = arr[0];
      let s = arr[1];
      let v = arr[2];
      let a = arr[3] || 1;

      s = s / 100;
      v = v / 100;
      let r = 0;
      let g = 0;
      let b = 0;
      let i = parseInt((h / 60) % 6);
      let f = h / 60 - i;
      let p = v * (1 - s);
      let q = v * (1 - f * s);
      let t = v * (1 - (1 - f) * s);
      switch (i) {
        case 0:
          r = v;
          g = t;
          b = p;
          break;
        case 1:
          r = q;
          g = v;
          b = p;
          break;
        case 2:
          r = p;
          g = v;
          b = t;
          break;
        case 3:
          r = p;
          g = q;
          b = v;
          break;
        case 4:
          r = t;
          g = p;
          b = v;
          break;
        case 5:
          r = v;
          g = p;
          b = q;
          break;
        default:
          break;
      }
      r = parseInt(r * 255.0);
      g = parseInt(g * 255.0);
      b = parseInt(b * 255.0);
      return [r, g, b, a];
    },
    /**
     * 删除关联的监测量
     */
    deleteRelationPoint() {
      this.svgElement.imgControl = '0'; // 更新监测量时，是否下控置为默认否
      this.$emit('deleteRelationPoint');
    },
    /**
     * 添加关联的监测量
     */
    addRelationPoint() {
      if (this.disabled) return;
      this.$emit('choosePoint', '', true);
      this.multiple = true;
      //this.svgElement.bgWidth = '302'
    },
    /**
     * 最大值最小值对应图片
     */
    chooseValueImg($event, type) {
      if (this.disabled) return;
      event.stopPropagation();
      this.$emit('chooseValueImg', type);
    },

    /**
     * 选择监测量
     */
    choosePoint(_index) {
      this.svgElement.imgControl = '0'; // 更新监测量时，是否下控置为默认否
      this.$emit('choosePoint', _index);
    },

    getPoint(value) {
      this.$emit('getPointList', value);
    }
  }
};
</script>

<style lang="less" scoped src="../svg.select.less"></style>
<style lang="less" scoped>
.tag--disabled {
  pointer-events: none;
}
.point-tree {
  /deep/ .tree-select {
    max-height: 300px !important;
    .virtual-tree {
      max-height: 300px !important;
      .vue-recycle-scroller {
        max-height: 300px !important;
      }
    }
  }
}
.element-form {
  max-height: 350px;
  overflow: auto;
  font-size: 14px;

  .demo-input-suffix {
    margin-bottom: 10px;

    .label-dia {
      display: inline-block;
      width: 80px;
      text-align: left;
    }

    .wpg-input-sm {
      width: 65%;
      height: 32px;
      padding: 1px 7px;
      line-height: 32px;
    }
  }

  .X-Y-axis .wpg-input {
    width: 25%;
  }

  .bar {
    box-sizing: border-box;
    width: 100%;
    .wpg-col {
      margin-bottom: 12px;
    }
    .ins-item {
      line-height: 24px;
      > ul {
        padding-left: 20px;
      }
      &:nth-child(1) {
        margin-bottom: 12px;
      }
    }
  }

  .color-picker__trigger {
    width: 32px;
    height: 32px;
    padding: 1px 4px 2px;
    font-size: 20px;
    vertical-align: top;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    cursor: pointer;
  }

  .choose-value-img {
    vertical-align: middle;
  }

  .wpg-select-sm .wpg-select-selection__rendered {
    margin-left: 7px;
    line-height: 32px !important;
  }

  .wpg-select-sm .wpg-select-selection--single {
    height: 32px !important;
    padding: 1px 7px;
    line-height: 32px !important;
  }
}
/deep/.wpg-select-dropdown-menu {
  min-height: 256px;
}
</style>
