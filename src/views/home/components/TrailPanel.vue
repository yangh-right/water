<template>
  <div ref="personPopup" :class="['person-popup', hideAllPanel ? 'full-height' : 'hide-height']">
    <div class="person-container">
      <div class="popup-header supply-text-third">
        <div class="person-title">
          <w-icon class="person-ico" type="ic_supervisor_account"></w-icon>
          <span>人员查询(共{{ statistics.total }}人)</span>
        </div>
        <div class="person-pullup" @click="trailPanelToggle">
          <span v-text="hideAllPanel ? '收起' : '展开'"></span>
          <w-icon
            type="ic_keyboard_capslock"
            :class="['supply-transform supply-transition', hideAllPanel ? 'supply-rotate-180' : '']"
          />
        </div>
      </div>
      <transition name="drop">
        <div v-show="hideAllPanel" class="popup-content">
          <div class="search-box">
            <w-input-search
              v-model="keyword"
              size="small"
              placeholder="输入人员姓名搜索"
              @keypress.enter="onKeywordChange"
              @search="onKeywordChange"
            />
          </div>
          <div class="table-container">
            <w-table
              :columns="columns"
              :data-source="personTrail"
              :pagination="false"
              :scroll="{ y: tableMaxHeight }"
              :loading="loading"
              rowKey="id"
              :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
              @change="onTableChange"
            >
              <template slot="filterDropdown">
                <OrgTree @change="onOrgChanged" />
              </template>
              <template slot="status" slot-scope="status">
                <span :class="['people-status', status === '0' ? 'offline' : 'online']">
                  {{ status | parseStatus }}
                </span>
              </template>
              <template slot="action" slot-scope="value, record">
                <span
                  v-if="selectedRowKeys.includes(record.id)"
                  class="supply-inline-block supply-align-middle supply-w-4 supply-h-4"
                  :style="{
                    backgroundColor: TRAIL_COLOR[selectedRowKeys.indexOf(record.id)]
                  }"
                ></span>
              </template>
            </w-table>
          </div>
          <div v-show="hideAllPanel" class="popup-footer">
            <div class="filter-active">
              <w-checkbox @change="handleFilterPeople">仅看在线人员</w-checkbox>
            </div>
            <div class="supply-text-gray-400">
              <span class="supply-px-2"
                >当前在线{{ statistics.online }}人 离线{{ statistics.offline }}人</span
              >
            </div>
          </div>
        </div>
      </transition>
    </div>
    <div v-show="hideAllPanel" class="person-date" :style="{width:personnelTrailTime === 'custom'?'670px':'472px'}">
      <span class="label-info">路线日期：</span>
      <w-radio-group
        class="supply-flex-none"
        v-model="personnelTrailTime"
        size="small"
        @change="getTrail"
      >
        <w-radio-button value="today"> 今天 </w-radio-button>
        <w-radio-button value="lastday"> 昨天 </w-radio-button>
        <w-radio-button value="custom"> 自定义 </w-radio-button>
      </w-radio-group>
      <div v-show="personnelTrailTime === 'custom'" class="date-define">
        <w-date-picker
          class="date-picker"
          v-model="customTime"
          :disabled-date="disabledDate"
          @change="getTrail"
        />
      </div>
      <div class="play-speed">
        <span class="label-info">播放速度：</span>
        <w-select
          class="speed-list"
          v-model="speedRate"
          @change="changeRate"
          size="small"
          :bordered="false"
          :dropdownMatchSelectWidth="false"
        >
          <w-select-option v-for="item in RATES" :key="item" :value="item">{{
            item
          }}</w-select-option>
        </w-select>
      </div>
      <div class="control-ico">
        <span class="left-ico" @click="playBackward">
          <w-icon type="step-backward" />
        </span>
        <a class="play-ico" @click="changePaused">
          <w-icon v-if="paused" theme="filled" type="play-circle" />
          <w-icon v-else theme="filled" type="pause-circle" />
        </a>
        <span class="right-ico" @click="playForward">
          <w-icon type="step-forward" />
        </span>
      </div>
    </div>
  </div>
</template>
<script>
import moment from 'moment';
import storage from '@/utils/storage';
import gcoord from 'gcoord';
import { getTrailPersonList, getUserLocation, getUsersLocation, getUserStatus } from '@/api/map';
import asyncCatch from '@/utils/asyncCatch';
import OrgTree from '@/views/home/components/OrgTree.vue';
import { TRAIL_COLOR } from '@/views/home/const';

/**
 * 人员轨迹路线日期
 * @param {string} type
 * @param {date} time
 * @returns
 */
function getTimeRange(type, time) {
  let getRangeTime = {
    today() {
      return {
        startTime: moment()
          .startOf('day')
          .format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment().format('YYYY-MM-DD HH:mm:ss')
      };
    },
    lastday() {
      let day = moment().subtract(1, 'days');
      return {
        startTime: day.startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        endTime: day.endOf('day').format('YYYY-MM-DD HH:mm:ss')
      };
    },
    custom: () => {
      const startTime = time.startOf('day').format('YYYY-MM-DD HH:mm:ss');
      const endTime = time.endOf('day').format('YYYY-MM-DD HH:mm:ss');
      return { startTime, endTime };
    }
  };
  return getRangeTime[type]();
}

export default {
  name: 'TrailPanel',
  components: {
    OrgTree
  },
  props: {
    defaultRate: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      hideAllPanel: true,
      loading: true,
      tableMaxHeight: 100,
      columns: [
        {
          title: '人员',
          dataIndex: 'userName',
          // width: 84,
          ellipsis: true
        },
        // {
        //   title: '组织',
        //   dataIndex: 'groupName',
        //   ellipsis: true,
        //   width: 84,
        //   filters: [],
        //   scopedSlots: {
        //     filterDropdown: 'filterDropdown'
        //   }
        // },
        {
          title: '状态',
          dataIndex: 'status',
          // width: 69,
          scopedSlots: { customRender: 'status' },
          filters: [
            {
              text: '离线',
              value: '0'
            },
            {
              text: '在线',
              value: '1'
            }
          ]
        },
        {
          title: ' ',
          dataIndex: 'action',
          width: 38,
          scopedSlots: { customRender: 'action' }
        }
      ],
      TRAIL_COLOR,
      peoplePaths: [],
      keyword: '',
      speedRate: 1,
      playIndex: 0,
      paused: true,
      onlineStatus: false,
      personTrail: [],
      personTrailCopy: [],
      RATES: [1, 5, 25], // 播放速度
      personnelTrailTime: 'today',
      customTime: null,
      selectedRowKeys: [], // 人员轨迹的选中
      statistics: {
        offline: 0,
        online: 0,
        total: 0
      },
      filters: {
        status: [],
        groupName: []
      }
    };
  },
  filters: {
    parseStatus(v) {
      return v === '0' ? '离线' : '在线';
    }
  },
  computed: {
    showPersonnelTime() {
      const { personnelTrailTime } = this;
      return personnelTrailTime === 'custom';
    }
  },
  mounted() {
    this.getPersonList();
    this.getCurrentPerson();
    this.getPersonStatus();

    //获取表格滚动高度
    this.$nextTick(() => {
      this.tableMaxHeight = this.$refs.personPopup.offsetHeight - 192;
    });
  },
  methods: {
    /**
     * 获取人员列表
     */
    async getPersonList() {
      let online = '';
      this.loading = true;
      if (this.filters.status.length === 1) {
        if (this.filters.status[0] === '0') {
          online = '0';
        } else {
          online = '1';
        }
      }
      let [err, { records }] = await asyncCatch(
        getTrailPersonList({
          keyword: this.keyword,
          onlineStatus: online,
          orgIds: this.filters.groupName,
          page: {
            size: 999
          }
        })
      );
      if (!err) {
        this.personTrail = records ?? [];
        this.personTrailCopy = records ?? [];
        this.selectedRowKeys = [];
      }
      this.loading = false;
    },
    /**
     * 获取实时人员定位信息
     */
    async getCurrentPerson() {
      let [err, records] = await asyncCatch(getUsersLocation({}));
      if (!err) {
        let personTrail =
          records?.filter(record => {
            let { lat, lng } = record;
            return !!lat && !!lng;
          }) ?? [];
        this.$bus.$emit('currentPerson', personTrail);
        this.$emit('hideLoading');
      }
    },
    /**
     * 获取统计信息
     */
    async getPersonStatus() {
      let [err, { resultData }] = await asyncCatch(getUserStatus());
      if (!err) {
        this.statistics.offline = resultData?.offline ?? 0;
        this.statistics.online = resultData?.online ?? 0;
        this.statistics.total = resultData?.total ?? 0;
      }
    },
    /**
     * 选择日期不超过今天
     * @param {*} current
     */
    disabledDate(current) {
      return current && current > moment().endOf('day');
    },
    /**
     * 人员姓名搜索
     */
    onKeywordChange() {
      this.getPersonList();
    },
    /**
     * 改变路线日期
     */
    getTrail() {
      if (this.personnelTrailTime !== 'custom') this.customTime = null;
      if (this.selectedRowKeys.length) {
        this.getPersonTrail();
      }
    },
    /**
     * 获取人员轨迹
     */
    async getPersonTrail() {
      let { personnelTrailTime, selectedRowKeys } = this;
      if (!selectedRowKeys.length) {
        // 清空
        this.paused = true;
        this.$bus.$emit('trailChange', []);
        return;
      }
      //自定义日期
      if (personnelTrailTime === 'custom' && !this.customTime) return;
      let params = {
        ...getTimeRange(personnelTrailTime, this.customTime),
        userIdList: selectedRowKeys
      };
      let [err, result] = await asyncCatch(getUserLocation(params));
      if (!err) {
        this.paused = false;
        let latLngType = this.$parent.$refs.oneMap.$refs.wpgMap.getLatLngType()
        this.peoplePaths = Object.entries(result).map(([id, path]) => {
          const result = this.personTrail.find(item => item.id === id);
          return {
            id,
            color: TRAIL_COLOR[this.selectedRowKeys.indexOf(id)],
            path: this.resolveAntPoints(path, latLngType),
            meta: path,
            name: result?.userName
          };
        });
        this.$bus.$emit('trailChange', this.peoplePaths);
      }
    },
    /**
     * 处理人员轨迹路径信息
     * @param {*} paths
     */
    resolveAntPoints(paths, latLngType) {
      return paths.reduce((result, path, i, arr) => {
        const _result = path.reduce(
          (sum, cur) => {
            if (!sum.last) {
              return {
                last: cur,
                total: []
              };
            }
            return {
              last: cur,
              total: [
                ...sum.total,
                {
                  ...sum.last,
                  data: [
                    gcoord.transform([sum.last.appealLng, sum.last.appealLat], gcoord.BD09, gcoord[latLngType]).reverse(),
                    gcoord.transform([cur.appealLng, cur.appealLat], gcoord.BD09, gcoord[latLngType]).reverse()
                  ]
                }
              ]
            };
          },
          { last: null, total: [] }
        );
        return [...result, ..._result.total];
      }, []);
    },
    /**
     * 改变轨迹播放速度
     */
    changeRate() {
      this.$bus.$emit('trailPlayChange', { ratio: this.speedRate, paused: this.paused });
    },
    playBackward() {
      this.$bus.$emit('prev');
    },
    playForward() {
      this.$bus.$emit('next');
    },
    /**
     * 改变播放状态
     */
    changePaused() {
      let { speedRate, paused } = this;
      if (!this.selectedRowKeys.length) {
        return;
      }
      this.paused = !paused;
      this.$bus.$emit('trailPlayChange', {
        paused: this.paused,
        ratio: speedRate
      });
    },
    // 人员轨迹的选择
    onSelectChange(keys) {
      if (keys.length > 5) {
        this.$message.warning('最多只能同时选择5人查看轨迹');
      } else {
        // 查找轨迹
        this.selectedRowKeys = keys;
        this.getPersonTrail();
      }
    },
    onTableChange(_, filters) {
      this.filters.status = filters.status ?? [];
      this.getPersonList();
    },
    onOrgChanged(keys) {
      this.filters.groupName = keys;
      this.getPersonList();
    },
    /**
     * 在线人员筛选
     * @param {*} e
     */
    handleFilterPeople(e) {
      if (e.target.checked) {
        this.personTrail = this.personTrailCopy.filter(item => {
          return item.status === '1';
        });
      } else {
        this.personTrail = this.personTrailCopy;
      }
    },
    /**
     * 人员查询收起展开
     */
    trailPanelToggle() {
      this.hideAllPanel = !this.hideAllPanel;
    }
  }
};
</script>

<style lang="less" scoped>
@defaultbgc: rgba(var(--supply-rgb-color-bg-card-DEFAULT), 0.9);
.full-height {
  height: calc(100% - 72px);
}
.hide-height {
  height: 36px !important;
}
.person-popup {
  width: 360px;
  position: absolute;
  left: 23px;
  top: 12px;
  border-radius: 4px;
  box-shadow: 1px 1px 12px 1px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(2px);
  z-index: 1002;
  background-color: var(--supply-color-bg-card-DEFAULT);

  .person-container {
    .drop {
      &-enter-active,
      &-leave-active {
        transition: all 0.15s;
      }

      &-enter,
      &-leave-to {
        height: 0;
        opacity: 0;
      }
    }
    .popup-header {
      height: 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 12px;
      border-radius: 4px;
      background-color: @defaultbgc;
      cursor: pointer;

      .person-ico {
        margin-right: 4px;
      }
      .person-pullup {
        display: flex;
        align-items: center;
        color: var(--supply-color-primary-DEFAULT);

        &:hover{
          color: var(--supply-color-primary-hover);
        }
      }
    }
    .popup-content {
    }
    .search-box {
      width: calc(100% - 24px);
      height: 30px;
      margin: 12px auto;
    }
    .table-container {
    }
    .popup-footer {
      width: calc(100% - 24px);
      height: 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 12px;
      border-radius: 4px;
      background-color: var(--supply-color-bg-card-DEFAULT);
      cursor: pointer;
      position: absolute;
      bottom: 12px;
      left: 12px;
    }
  }

  .person-date {
    height: 42px;
    line-height: 30px;
    display: inline-block;
    padding: 6px 12px;
    box-sizing: border-box;
    position: absolute;
    top: 0px;
    left: 373px;
    border-radius: 4px;
    box-shadow: 1px 1px 12px 1px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(2px);
    background-color: var(--supply-color-bg-card-DEFAULT);

    .label-info{
      display: inline-block;
      width: 70px;
      float: left;
    }

    .supply-flex-none{
      float: left;
    }

    .date-define {
      height: 30px;
      line-height: 30px;
      float: left;
      margin-left: 12px;

      /deep/.wpg-input {
        height: 30px !important;
      }
    }
    .play-speed {
      margin-left: 12px;
      float: left;
    }
    .speed-speed {
      height: 30px;
      /deep/.wpg-select-selection {
        border: none !important;
      }
      /seep/.wpg-select-arrow {
        margin-top: -8px;
      }
    }

    .control-ico {
      height: 30px;
      display: flex;
      align-items: center;
      float: left;
      margin-left: 12px;

      .left-ico,
      .right-ico {
        display: inline-block;
        width: 30px;
        height: 20px;
        line-height: 20px;
        text-align: center;
        cursor: pointer;
        color: var(--supply-color-deviate);

        &:hover {
          color: var(--supply-color-primary-hover);
        }
      }
      .play-ico {
        width: 30px;
        height: 30px;
        font-size: 20px;
        line-height: 30px;
        cursor: pointer;

        i {
          display: inline-block;
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}
</style>
