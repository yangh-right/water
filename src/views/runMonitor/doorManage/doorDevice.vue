<!--
 * @Description: 门禁设备
 * @Author: liuct
 * @Date: 2021-06-23 15:28:15
 * @LastEditTime: 2024-06-07 14:23:58
 * @LastEditors:  Do not edit
-->
<template>
  <!-- 门禁管理 -->
  <div id="manageCard" class="manage-card">
    <template v-if="list.length <= 0">
      <w-empty></w-empty>
    </template>
    <w-spin v-if="loading" class="loading" />
    <div class="card-block">
      <div v-for="doors in list" :key="doors.id" :class="['card-item',state.theme=== 'dark' ? 'dark-card-border' : '']">
        <div class="custom-carousel">
          <div v-for="(door, i) in doors.areaStationDeviceList" :key="i">
            <div v-show="i === doors.current">
              <div class="card-title supply-bg-bg-card-dark">
                <span class="door-name">{{ doors.stationName }}</span>
                <span class="title-right" @click="goRecord(doors.accessName)">
                  门禁记录
                </span>
              </div>
              <div class="card-body">
                <div>
                  <span class="name">门禁名称:</span>
                  <span class="value" :title="doors.accessName">
                    {{ doors.accessName }}
                  </span>
                </div>
                <div>
                  <span class="name">门禁状态:</span>
                  <span
                    class="value"
                    :style="
                      doors.status === '0'
                        ? 'color:#999'
                        : doors.status === '1'
                        ? 'color:#0ACC9D'
                        : 'color:#F59F00'
                    "
                  >
                    {{ doors.statusName }}
                  </span>
                </div>
                <div>
                  <span class="name">远程控制:</span>
                  <span class="but">
                    <w-button
                      v-if="buttonCodes['runMonitorDoorManage_open']"
                      class="control-but"
                      @click="setDoorCtr(doors, 1)"
                    >
                      开门
                    </w-button>
                    <w-button
                      v-if="buttonCodes['runMonitorDoorManage_close']"
                      class="control-but"
                      @click="setDoorCtr(doors, 0)"
                    >
                      关门
                    </w-button>
                    <span
                      v-if="doors.isWPG && buttonCodes['runMonitorDoorManage_password']"
                      class="tips"
                      title="获取动态密码"
                      @click="getDynamicPassword(door)"
                      >获取动态密码</span
                    >
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-show="doors.areaStationDeviceList.length > 1" class="custom-dots">
            <div
              v-for="(door, i) in doors.areaStationDeviceList"
              :key="i"
              :class="['dot', i === doors.current ? 'active' : '']"
              @click="doors.current = i"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="pagination-con">
      <w-pagination
        :current="page.currentPage"
        :total="total"
        :page-size="page.pageSize"
        @change="changeListC"
      />
    </div>

    <w-modal
      width="794px"
      :bodyStyle="{ height: '400px' }"
      title="获取动态密码"
      :visible="visible"
      okText="发送"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div class="modal-con query-form">
        <p class="code">{{ dynamicInfo.password }}</p>
        <p class="tips">动态密码30分钟后失效</p>
        <div>
          <span class="name">门禁名称:</span>
          <span class="value">{{ dynamicInfo.accessName }}</span>
        </div>
        <div>
          <span class="name">转发密码给:</span>
          <span class="value">
            <w-select
              v-model="sendPerson"
              mode="tags"
              placeholder="请选择\输入"
              style="width: 189px"
              @search="handleSearch"
              @popupScroll="popupScroll"
              @select="handleSelect"
            >
              <w-select-option
                v-for="(person, index) in renderedOptions"
                :key="index"
                :value="person.phone + ',' + person.userName"
              >
                {{ person.userName + person.phone }}
              </w-select-option>
            </w-select>
          </span>
        </div>
      </div>
    </w-modal>
  </div>
</template>

<script>
const LOAD_NUM = 30; // 加载条数--可自定义
import { mapState } from 'vuex';
import {
  getAccessDevice,
  ctrlHKAccess,
  getDynamicPassword,
  sendDoorPwd,
  getPerson
} from '@/api/runMonitor';
import debounce from 'lodash/debounce';
export default {
  name: 'DoorDevice',
  data() {
    this.popupScroll = debounce(this.handlePopupScroll, 400);
    return {
      list: [],
      total: 0,
      loading:true,
      visible: false,
      dynamicInfo: {
        password: '',
        accessName: '',
        productCode: 'water_purification',
        accessId: ''
      },
      searchVal: '',
      sendPerson: [],
      renderedOptions: [],
      page: {
        keyword: '',
        currentPage: 1,
        pageSize: 20,
        productCode: 'water_purification'
      }
    };
  },
  inject: ['state'],
  computed: {
    ...mapState('account', {
      currUser: 'user'
    }),
    ...mapState('setting', ['buttonCodes'])
  },
  mounted() {
    this.getPerson();
  },
  methods: {
    // 查询门禁管理数据
    async getAccessDevice(params = {}) {
      this.page = {
        ...this.page,
        ...params
      };
      this.loading = true;
      //this.globalLoading.show({ domId: 'manageCard' });
      const { count, resultData } = await getAccessDevice(this.page);
      this.loading = false;
      //this.globalLoading.hide({ domId: 'manageCard' });
      this.total = count;
      resultData.map(item => {
        item.current = 0;
        return item;
      });
      this.list = resultData;
    },

    // 获取人员列表
    getPerson() {
      this.personLists = [];
      getPerson(this.currUser.userId).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          this.personLists = resultData.filter(item => item.phone);
          this.renderedOptions = this.personLists.slice(0, LOAD_NUM);
        }
      });
    },

    goRecord(name) {
      this.goto({
        path:'/runMonitor/doorRecord',
        query:{ name,}
      })
    },
    setDoorCtr(door, value) {
      this.$confirm({
        title: '提示',
        content: '您确认要进行此操作吗？',
        okText: '确认',
        cancelText: '取消',
        class: 'pro-modal-confirm',
        centered: true,
        onOk: () => {
          let sendData = {
            accessDeviceId: door.accessId,
            value: value,
            deviceType: door.deviceType,
            productCode: 'water_purification'
          };
          ctrlHKAccess(sendData).then(res => {
            let { status } = res;
            if (status === 'complete') {
              door.accStatus = '...';
              this.$message.success('下控成功');
            }
          });
        },
        onCancel: () => {}
      });
    },
    // 获取动态密码
    async getDynamicPassword(record) {
      let { status, resultData } = await getDynamicPassword(record.accessId);
      if (status === 'complete') {
        this.visible = true;
        this.dynamicInfo.accessName = record.accessName;
        this.dynamicInfo.password = resultData;
        this.dynamicInfo.accessId = record.accessId;
        this.sendPerson = [];
      }
    },

    // 取消
    handleCancel() {
      setTimeout(() => {
        this.visible = false;
      }, 500);
    },

    // 发送动态密码
    handleOk() {
      let phones = this.sendPerson.map(item => {
        let arr = item.split(',');
        return [arr[1], arr[0]];
      });
      const params = {
        ...this.dynamicInfo,
        receivers: Object.fromEntries(phones)
      };
      this.$confirm({
        title: '提示',
        content: '您确定要转发密码吗？',
        onOk: () => {
          sendDoorPwd(params).then(res => {
            if (res.status === 'complete') {
              this.visible = false;
              this.$message.success('发送成功');
            }
          });
        }
      });
    },

    // 文本框值变化时触发 -- 从数据源中过滤出含搜索内容的数据，并取过滤结果的前n条作为下拉列表的可选项
    handleSearch(val) {
      this.searchVal = val;
      let filterList = [];
      if (val) {
        filterList = this.personLists.filter(item => {
          let value = item.phone + ',' + item.userName;
          return value.indexOf(val) > -1;
        });
      } else {
        filterList = this.personLists;
      }
      this.filterDataList = filterList;
      this.renderedOptions =
        filterList.length < LOAD_NUM ? filterList : filterList.slice(0, LOAD_NUM);
    },

    handlePopupScroll() {
      if (this.searchVal === '') {
        this.loadMoreData(this.personLists);
      } else {
        this.loadMoreData(this.filterDataList);
      }
    },

    // 加载更多数据到select框
    loadMoreData(dataList) {
      const renderedLen = this.renderedOptions.length; // 已渲染的下拉列表长度
      const totalLen = dataList.length; // 当前数据源的长度
      let addList = [];
      if (renderedLen < totalLen) {
        if (renderedLen + LOAD_NUM <= totalLen) {
          addList = dataList.slice(renderedLen, renderedLen + LOAD_NUM);
        } else {
          addList = dataList.slice(renderedLen, renderedLen + (totalLen % LOAD_NUM));
        }
        this.renderedOptions = this.renderedOptions.concat(addList);
      }
    },

    // 被选中时调用，参数为选中项的 value (或 key) 值
    handleSelect(val) {
      if (this.searchVal) {
        // 从数据源中过滤出下拉框选中的值，并返回一个数组
        const selectedArr = this.personLists.filter(item => item === val);
        const restList = this.personLists.filter(item => item !== val); // 从数据源中过滤出其他的值，返回一个数组
        const newList = selectedArr.concat(restList).slice(0, LOAD_NUM); // 将选中的元素放到下拉列表的第一位
        this.renderedOptions = newList; // 更新已渲染的下拉列表
        this.personLists = selectedArr.concat(restList); // 更新数据源
        this.searchVal = ''; // 因为触发handleSelect函数时，会自动清空用户输入的内容。因此，searchVal需要重置。
      }
    },

    changeListC(page, pageSize) {
      this.page.currentPage = page;
      this.getAccessDevice();
    }
  }
};
</script>

<style lang="less" scoped>
.manage-card {
  height: 100%;
  overflow: hidden;
  position: relative;
  .loading {
    position: absolute;
    top:0;
    width: 100%;
    height: 100%;
    background: rgba(255,255,255,.4);
    z-index:1100;
    /deep/ .wpg-spin-dot-spin{
     position: absolute;
     top:5%;
     left:49%;
    }
  }

  .card-block {
    width: 100%;
    padding: 0 20px;
    height: calc(100% - 52px);
    overflow: auto;
    .dark-card-border{
      box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.8) !important;
    }
    .card-item {
      display: inline-block;
      width: calc((100% - 60px) / 3);
      height: 176px;
      margin: 9px;
      box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      position: relative;
      .custom-carousel {
        .custom-dots {
          position: absolute;
          bottom: 10px;
          width: 100%;
          text-align: center;
          .dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 55%;
            background: #dfdfdf;
            margin-right: 12px;
            cursor: pointer;
            &.active {
              background: #82afff;
            }
          }
        }
      }
      .card-title {
        border-radius: 4px 4px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 44.52px;
        font-size: 14px;
        padding: 0 20px;
        .door-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .title-right {
          cursor: pointer;
          font-size: 12px;
          color: #4285f4;
          width: 60px;
          text-align: right;
        }
      }
      .card-body {
        > div {
          display: flex;
          padding: 0 20px;
          font-size: 12px;
          .name {
            flex: 0 0 60px;
            width: 60px;
            color: #666666;
            margin-top: 12px;
          }
          .value {
            margin-top: 12px;
            color: #999999;
            width: calc(100% - 70px);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .but {
            margin-top: 12px;
            flex: auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            .control-but {
              height: 28px;
              line-height: 26px;
              font-size: 14px;
              border: 1px solid #4285f4;
              border-radius: 4px;
              background: transparent;
              color: #4285f4;
              text-align: center;
              margin-right: auto;
              &:nth-child(1) {
                margin-right: 12px;
              }
            }
            .tips {
              cursor: pointer;
              color: #4285f4;
              font-size: 12px;
              margin-left: auto;
            }
          }
        }
      }
      /deep/.wpg-carousel {
        li {
          button {
            width: 8px;
            height: 8px;
            background: #dfdfdf;
            border-radius: 55%;
          }
        }
        .slick-active {
          button {
            background: #82afff;
          }
        }
      }
    }
  }
  .pagination-con {
    height: 52px;
    padding: 12px 29px;
    text-align: right;
  }
}
.modal-con {
  .code {
    font-size: 26px;
    color: #4285f4;
    margin-top: 39px;
    text-align: center;
  }
  .tips {
    font-size: 12px;
    color: #999999;
    margin-bottom: 39px;
    text-align: center;
  }
  > div {
    width: 290px;
    margin: auto;
    margin-bottom: 16px;
  }
  .name {
    display: inline-block;
    width: 85px;
    text-align: right;
    font-size: 14px;
    color: #666666;
    margin-right: 10px;
  }
  .value {
    font-size: 14px;
    color: #999999;
  }
}
</style>
