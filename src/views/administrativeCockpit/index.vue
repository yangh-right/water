<!--
 * @Author: wangyr
 * @Date: 2023-06-15 10:59:17
 * @LastEditors: fengtaotao
 * @LastEditTime: 2025-04-01 09:36:06
 * @Description:
-->
<template>
  <div :class="['page', themeConfig.className]">
    <!-- 页面头部 -->
    <div class="page-header">
      <!-- 天气信息 -->
      <div class="weather">
        <div class="address">
          <img src="@/assets/administrativeCockpit/location.png" alt="" />
          <div class="text">{{ address }}</div>
        </div>
        <div class="time">{{ currentTime }}</div>
      </div>
      <!-- 配置按钮 -->
      <div class="config" @click="handleTabs">
        <img src="@/assets/administrativeCockpit/config.png" alt="" />
        <div class="text">配置</div>
      </div>
      <!-- 页面标题 -->
      <div class="page-header-title">行政驾驶舱</div>
      <div></div>
    </div>
    <!-- 加载中 -->
    <w-spin v-if="loading" />
    <!-- 驾驶舱内容 -->
    <div id="cockpit" class="page-content">
      <!-- 遍历模块列表，动态加载组件 -->
      <div v-for="item in moduleList" :key="item.order" class="page-content-box">
        <card-title :title="item.name">
          <!-- 党组织活动时间选择 -->
          <w-select
            v-if="item.buttonCode === 'partyActivity'"
            style="width: 120px"
            v-model="partyTime"
            slot="headerRight"
          >
            <w-select-option v-for="item in timeList" :key="item.value" :value="item.value">{{
              item.label
            }}</w-select-option>
          </w-select>
          <!-- 能力分析用户选择 -->
          <w-select
            v-if="item.buttonCode === 'competencyAnalysis'"
            style="width: 120px"
            v-model="userId"
            slot="headerRight"
          >
            <w-select-option v-for="item in userList" :key="item.userId" :value="item.userId">{{
              item.name
            }}</w-select-option>
          </w-select>
          <!-- 考试排名选择 -->
          <div v-if="item.buttonCode === 'examRanking'" slot="headerRight">
            <w-select style="width: 200px" v-model="currentTest">
              <w-select-option
                v-for="item in testList"
                :key="item.testPlanId"
                :value="item.testPlanId"
                >{{ item.testPlanName }}</w-select-option
              >
            </w-select>
          </div>
          <!-- 劳动力管理详情跳转 -->
          <div
            v-if="item.buttonCode === 'workforceManagement'"
            slot="headerRight"
            class="workforce"
            @click="goTeamManage"
          >
            <span>详情</span>
            <w-icon type="right" style="margin-left:4px;font-size: 12px;"></w-icon>
          </div>
          <!-- 成本分析 -->
          <div v-if="item.buttonCode === 'costAnalysiss'" slot="headerRight" class="costAnalysis">
            <w-select style="width: 120px" v-model="costTime" slot="headerRight">
              <w-select-option v-for="item in costTimeList" :key="item.value" :value="item.value">{{
                item.label
              }}</w-select-option>
            </w-select>
          </div>
        </card-title>
        <!-- 动态加载组件 -->
        <component
          :is="item.buttonCode"
          :partyTime="partyTime"
          :costTime="costTime"
          :userId="userId"
          :currentTestId="currentTest"
        ></component>
      </div>
    </div>
    <!-- 模块配置对话框 -->
    <modules-dialog
      :visible="rangeVisible"
      :keys="moduleKeys"
      @rangeOK="rangeOK"
      :moduleType="moduleType"
      @rangeCancel="rangeCancel"
    ></modules-dialog>
  </div>
</template>

<script>
import moment from 'moment';
import modulesDialog from '@/components/modulesDialog.vue';
import Sortable from 'sortablejs';
import uuid from '@/utils/uuid';
import {
  queryCockpitList,
  editPlate,
  getTestPlanLines,
  getTestUserDetailLines
} from '@/api/cockpit.js';
import { getWeather } from '@/api/public';
import { themeMixin } from '@/core/mixins.ts';
export default {
  name: 'AdministrativeCockpit',
  components: {
    cardTitle: () => import('./components/cardTitle.vue'),
    modulesDialog,
    examination: () => import('./components/examination.vue'),
    questionBank: () => import('./components/questionBank.vue'),
    examRanking: () => import('./components/examRanking.vue'),
    competencyAnalysis: () => import('./components/competencyAnalysis.vue'),
    workforceManagement: () => import('./components/workforceManagement.vue'),
    partyActivity: () => import('./components/partyActivity.vue'),
    suggestionBoxs: () => import('./components/suggestionBox.vue'),
    sporadicProjects: () => import('./components/sporadicProjects.vue'),
    costAnalysiss: () => import('./components/costAnalysis.vue')
  },
  mixins: [themeMixin], // 使用主题混入
  data() {
    return {
      // 主题配置
      themeConfigMap: {
        default: {
          className: 'cockpit-default'
        },
        dark: {
          className: 'cockpit-dark'
        }
      },
      address: '', // 地址信息
      partyTime: '4', // 党组织活动时间
      allList: [], // 所有模块列表
      currentTime: '', // 当前时间
      weather: {
        type: '', // 天气类型
        temperature: ``, // 温度
        now: '' // 当前温度
      },
      loading: false, // 加载状态
      userId: '', // 当前选中的用户ID
      rangeVisible: false, // 配置对话框显示状态
      testList: [], // 考试列表
      currentTest: '', // 当前选中的考试
      userList: [], // 用户列表
      // 时间列表
      timeList: [
        {
          value: '1',
          label: '当月'
        },
        {
          value: '2',
          label: '近三月'
        },
        {
          value: '3',
          label: '近半年'
        },
        {
          value: '4',
          label: '近一年'
        }
      ],
      costTimeList: [
        {
          value: '1',
          label: '昨日'
        },
        {
          value: '2',
          label: '近一月'
        },
        {
          value: '3',
          label: '近一年'
        }
      ],
      costTime: '3',
      moduleType: '1', // 模块类型
      moduleKeys: [], // 模块键值列表
      moduleList: [] // 模块列表
    };
  },
  computed: {},
  activated() {
    this.getBaiduWeather(); // 获取天气信息
    setInterval(() => {
      this.currentTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    }, 1000);
  },
  created() {
    this.getUserTree(); // 获取用户模块树
    this.getTestList(); // 获取考试列表
    this.getUser(); // 获取用户列表
  },
  mounted() {
    this.changeSort(); // 初始化排序功能
  },
  methods: {
    // 获取考试列表
    async getTestList() {
      let params = {
        testState: '3',
        endTime: '',
        startTime: '',
        page: {
          current: 0,
          size: 1000
        }
      };
      let { resultData, status } = await getTestPlanLines(params);
      if (status === 'complete') {
        this.testList = this.uniqueById(resultData.records, 'testPlanId');
        this.currentTest = this.testList[0].testPlanId;
      }
    },
    // 获取用户列表
    async getUser() {
      let params = {
        page: {
          current: 0,
          size: 1000
        }
      };
      let { resultData, status } = await getTestUserDetailLines(params);
      if (status === 'complete') {
        this.userList = resultData.records || [];
        this.userId = this.userList[0]?.userId || '';
      }
    },
    // 根据ID去重
    uniqueById(arr, key) {
      const seen = new Map();
      return arr.filter(item => {
        if (seen.has(item[key])) {
          return false;
        }
        seen.set(item[key], true);
        return true;
      });
    },
    // 获取用户模块树
    async getUserTree() {
      let { resultData, status } = await queryCockpitList(this.moduleType);
      if (status === 'complete') {
        // 模块展示
        this.moduleList = resultData.filter(item => item.isShow === '1');
        this.allList = resultData;
        this.moduleList.forEach(item => {
          item['uuid'] = uuid();
        });
        this.moduleKeys = this.moduleList.map(item => item.buttonCode);
      }
    },
    // 处理配置按钮点击
    handleTabs() {
      this.rangeVisible = true;
    },
    // 处理配置确认
    rangeOK(keys, modules) {
      this.rangeVisible = false;
      let params = {
        charts: modules,
        moduleType: this.moduleType
      };
      editPlate(params).then(res => {
        let { status } = res;
        if (status === 'complete') {
          this.$message.success('配置成功!');
          this.getUserTree();
        }
      });
    },
    // 处理配置取消
    rangeCancel() {
      this.rangeVisible = false;
    },
    // 初始化排序功能
    changeSort() {
      const dom = document.querySelector('#cockpit');
      Sortable.create(dom, {
        animation: 150,
        filter: '.add-plate',
        chosenClass: '', // 被选中项的css 类名
        dragClass: 'sortable-chosen', // 正在被拖拽中的css类名
        onUpdate: evt => {
          // evt.newIndex evt.oldIndex 得到拖动的元素索引
          // 根据索引找到展示的模块名称
          let newIndexValue = this.moduleList[evt.newIndex].name;
          let oldIndexValue = this.moduleList[evt.oldIndex].name;
          // 根据拖动的模块名称找到总模块的拖动索引
          let index1 = this.allList.findIndex(item => item.name === newIndexValue);
          let index2 = this.allList.findIndex(item => item.name === oldIndexValue);
          // 交换两个模块的sort值
          [this.allList[index1].sort, this.allList[index2].sort] = [
            this.allList[index2].sort,
            this.allList[index1].sort
          ];
          let params = {
            charts: this.allList,
            moduleType: this.moduleType
          };
          editPlate(params).then(res => {
            if (res.status === 'complete') {
              this.$message.success(res.resultData);
            } else {
              this.$message.warning(res.errorMessage);
            }
          });
        }
      });
    },
    // 获取天气信息
    async getBaiduWeather() {
      let { resultData, status } = await getWeather();
      if (status === 'complete') {
        let { result } = resultData;
        this.address = result.location.city;
        this.weather = {
          type: result.now.text,
          temperature: `${result.forecasts[0].low}℃~${result.forecasts[0].high}℃`,
          now: `${result.now.temp}℃`
        };
      }
    },
    // 跳转到班组管理
    goTeamManage() {
      this.drillDown({
        path: '/System/OnDutyConfig/ShiftManage'
      });
    }
  }
};
</script>

<style lang="less" scoped>
.page {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: #f0f4f3;
  height: 100%;
  border-radius: 4px;
  &.cockpit-dark {
    background: #12161d;
    .page-header {
      background: url('~@/assets/cockpit/title_bg_dark.png') center center no-repeat;
      background-size: 100% 100%;
      .page-header-title {
        color: #fff;
      }
      .weather {
        .address {
          .text {
            color: #fff;
          }
        }
        .time {
          color: #fff;
        }
      }
    }
  }
  .page-header {
    position: relative;
    width: 100%;
    height: 75px;
    background: url('~@/assets/administrativeCockpit/title_bg.png') center center no-repeat;
    background-size: 100% 100%;
    .weather {
      position: absolute;
      top: 25px;
      left: 4px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .address {
        display: flex;
        align-items: center;
        img {
          width: 20px;
          height: 20px;
        }
        .text {
          margin-left: 4px;
          font-family: PingFangSC-Medium, sans-serif;
          font-weight: 500;
          font-size: 16px;
          color: #235f5e;
          letter-spacing: 0;
        }
      }
      .time {
        margin-left: 45px;
        font-family: PingFangSC-Medium, sans-serif;
        font-weight: 500;
        font-size: 14px;
        color: #235f5e;
        letter-spacing: 0;
      }
    }
    .config {
      position: absolute;
      top: 25px;
      right: 6px;
      width: 72px;
      height: 29.37px;
      background: #008583;
      border-radius: 4px;
      padding: 4px 12px;
      display: flex;
      align-items: center;
      cursor: pointer;
      img {
        width: 16px;
        height: 16px;
      }
      .text {
        margin-left: 4px;
        font-family: PingFangSC-Medium, sans-serif;
        font-weight: 500;
        font-size: 14px;
        color: #ffffff;
        letter-spacing: 0;
      }
    }
  }
  .page-header-title {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: MiSans-Bold, sans-serif;
    font-weight: 700;
    font-size: 37.48px;
    color: #0d4f4e;
    letter-spacing: 5px;
  }
  .page-content {
    width: 100%;
    height: calc(100% - 75px);
    padding: 0 12px 12px 12px;
    display: flex;
    align-content: flex-start;
    flex-wrap: wrap;
    justify-content: flex-start;
    overflow: auto;
    .page-content-box {
      width: calc((100% - 24px) / 3);
      height: 300px;
      margin-right: 12px;
      margin-bottom: 12px;
      padding: 16px;
      background: var(--supply-color-bg-card-DEFAULT);
      .workforce {
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: #999999;
        letter-spacing: 0;
        cursor: pointer;
      }
      .costAnalysis {
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: #999999;
        letter-spacing: 0;
      }
    }
    .page-content-box:nth-child(3) {
      margin-right: 0px;
    }
    .page-content-box:nth-child(6) {
      margin-right: 0px;
    }
    .page-content-box:nth-child(7) {
      margin-bottom: 0px;
    }
    .page-content-box:nth-child(8) {
      margin-bottom: 0px;
    }
    .page-content-box:nth-child(9) {
      margin-bottom: 0px;
      margin-right: 0px;
    }
  }
}
.wpg-spin {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: calc(100% - 75px);
}
/deep/ .wpg-select-selection--single {
  height: 30px;
  .wpg-select-selection__rendered {
    line-height: 28px;
  }
}
/deep/ .wpg-input {
  height: 30px;
}
</style>
