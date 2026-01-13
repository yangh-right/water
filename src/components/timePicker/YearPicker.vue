<template>
  <!-- 年份组件 -->
  <div class="yearDate">
    <div class="inputBox">
      <w-input v-model="yearInput" readOnly class="yearInput" @click="showDate" />
      <w-icon type="calendar" class="anticon-calendar wfc2" />
    </div>
    <div class="year-content-wrap" v-clickoutside="clickOut">
      <div class="chooseBox wbgc-card" ref="listHeight" style="box-shadow: 0 2px 8px rgb(0 0 0 / 15%)" v-show="showList" @mouseleave="handleLeave">
        <div class="input-wrap">
          <w-input ref="modFocus" readOnly v-model="newYear" class="modInput" @blur="handleBlur" />
        </div>
        <div class="footer">
          <div class="btnBox">
            <span class="left wfc2" @click="handleOld" v-show="isMoreOld">
              <w-icon type="double-left" />
            </span>
            <span class="mid wfc2">{{ dateSlot }}</span>
            <span class="right wfc2" @click="handleNow" v-show="isMoreNow">
              <w-icon type="double-right" />
            </span>
          </div>
          <div class="listBox">
            <ul>
              <li v-for="(item, index) in dateShowList" :key="index" @click="edit(item)">
                <span :disabled="item.disabled" :class="item.disabled ? 'dis-color' : active === item.name ? 'active' : 'wfc2'">{{ item.name }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import moment from 'moment';
// import { merge } from "lodash-es";
export default {
  name: 'yearDate',
  props: {
    model: {
      type: String,
      default: undefined
    },
    keys: {
      type: String,
      default: 'time'
    },
    disabledData: {
      type: Number,
      default: 0
    },
    format: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      active: undefined, // 选中
      year: undefined,
      yearInput: undefined,
      dateSlot: '', // 显示的年份区间
      dateList: {
        // 所有年份（暂时只做三个区间）
        now: [],
        old: [],
        moreOld: []
      },
      isMoreOld: true, // 左右箭头显隐
      isMoreNow: true,
      dateShowList: [], // 展示的年份
      showList: false, // 展示年份面板的显隐
      newYear: '', // 新的输入框
      isSel: false, // 点击选中的
      isLeave: false, // 面板鼠标移出
      minRange: '', // 中间的年份区间
      isBlur: false // 输入框失去焦点
    };
  },
  mounted() {
    this.year = Number(this.model) || new Date().getFullYear();
    this.yearInput = this.format || this.year;
    this.newYear = this.year;
    this.active = this.year;
    this.disabledData = this.disabledData ? this.disabledData : undefined;
    setTimeout(() => {
      let width = document.querySelector('.yearInput').offsetWidth;
      document.querySelector('.year-content-wrap .chooseBox').style.left = 300 - width > 0 ? -(300 - width) + 'px' : 0;
    }, 1);
  },
  watch: {
    model: {
      handler() {
        this.year = Number(this.model) || new Date().getFullYear();
        this.yearInput = this.format || this.year;
        this.newYear = this.year;
        this.active = this.year;
      },
      deep: true
    }
  },
  methods: {
    moment,
    // 获取输入的值，用于判断不能超过今年年度
    getInputYear(e) {
      if (Number(e.target.value) > Number(new Date().getFullYear())) {
        // this.newYear = new Date().getFullYear();
        this.newYear = this.year;
      }
    },
    // 获取展示的数据
    getList() {
      let newYear = new Date().getFullYear();
      let isFeature = this.year - newYear;
      if (isFeature > 0) {
        this.getDateList(this.year * 1 + 12, this.year);
      } else {
        this.getDateList(this.year);
      }
    },
    getDateList(year, elseYear) {
      elseYear = elseYear || '';
      let newYear = new Date().getFullYear();
      let isFeature = year - newYear;
      let num = Math.floor(Math.abs(isFeature) / 12);
      let data = [];
      if (isFeature >= 1) {
        // 存入之后的时间
        for (let i = 0; i < 12; i++) {
          data.push({
            id: i,
            disabled: this.disabledData ? newYear + 11 * (num - 1) + i + num > this.disabledData : false,
            name: newYear + 11 * (num - 1) + i + num
          });
        }
      } else {
        // 存入之前的时间
        for (let i = 0; i < 12; i++) {
          if (newYear - (11 * (num + 1) + num - i) > 0) {
            data.push({
              id: i,
              disabled: this.disabledData ? newYear - (11 * (num + 1) + num - i) > this.disabledData : false,
              name: newYear - (11 * (num + 1) + num - i)
            });
          } else {
            this.isMoreNow = true;
            this.isMoreOld = false;
            break;
          }
        }
      }
      this.dateShowList = data;
      this.dateShowList.filter(val => {
        if (elseYear) {
          if (val.name === elseYear) {
            this.active = val.name;
          }
        } else {
          if (val.name === year) {
            this.active = val.name;
          }
        }
      });
      // 年份区间展示
      this.dateSlot = String(this.dateShowList[0].name) + '-' + String(this.dateShowList[11].name);
    },
    // 点击右箭头
    handleNow() {
      let newYear = new Date().getFullYear();
      this.newYear = this.newYear * 1 + 12;
      // this.year = this.newYear;

      let isFeature = this.newYear - newYear;
      let num = Math.abs(isFeature) % 12;
      if (isFeature > 0) {
        if (num === 0) {
          this.getDateList(this.newYear);
        } else {
          this.getDateList(this.newYear * 1 + 12, this.newYear);
        }
      } else {
        this.getDateList(this.newYear);
      }
    },
    // 点击左箭头
    handleOld() {
      this.newYear = this.newYear * 1 - 12;
      // this.year = this.newYear;
      let newYear = new Date().getFullYear();
      let isFeature = this.newYear - newYear;
      if (isFeature > 0) {
        this.getDateList(this.newYear * 1 + 12, this.newYear);
      } else {
        this.getDateList(this.newYear);
      }
    },
    // 点击旧输入框
    showDate() {
      this.getList();
      this.newYear = this.year;
      this.showList = true;
      this.$nextTick(() => {
        // 自动获取焦点
        this.$refs.modFocus.focus();
        // 旧输入框图标隐藏
        document.querySelector('.anticon-calendar svg').style.display = 'none';
      });
    },
    // 点击年份
    edit(item) {
      if (item.disabled) {
        return;
      } else {
        this.isSel = true;
        // 输入框失去焦点并且点击了某个年份
        if (this.isSel) {
          this.active = item.name;
          this.newYear = item.name;
          this.showList = false;
          this.$nextTick(() => {
            // 传值给父组件
            this.$emit('change', moment(String(item.name)).format('YYYY'));
            // 旧输入框图标显示
            document.querySelector('.anticon-calendar svg').style.display = 'inline-block';
          });
        }
        this.isLeave = false;
        this.isBlur = false;
        this.isSel = false;
      }
    },
    // 失去焦点
    handleBlur() {
      this.isBlur = true;
    },
    clickOut() {
      this.getOutReset();
    },
    // 鼠标移出弹窗
    handleLeave() {
      // 必须要延迟触发，不然失去焦点没触发到就直接执行了
      // clearTimeout(timer);
      // let timer = setTimeout(() => {
      //   this.getOutReset();
      // }, 6000);
    },
    getOutReset() {
      this.showList = false;
      this.isBlur = false;
      this.isLeave = false;
      this.isSel = false;
      this.year = this.year || new Date().getFullYear();
      this.yearInput = this.format || this.year;
    }
  }
};
</script>
<style lang="less" scoped>
// 年份组件公共样式
.yearDateCommon {
  // 父组件必须加的类名（防止数据太少，页面高度小于年份组件要展示的高度）
  min-height: 64vh;
}

.yearDate {
  position: relative;
  flex: 1;

  .inputBox {
    height: 28px;
    position: relative;
    .yearInput {
      position: absolute;
      height: 28px;
    }
    .anticon-calendar {
      position: absolute;
      right: 10px;
      line-height: 28px;
    }
  }

  .year-content-wrap {
    // height: 44px;
    .chooseBox {
      position: absolute;
      top: 0px;
      left: 0px;
      width: 300px;
      font-size: 14px;
      line-height: 1.5;
      text-align: left;
      list-style: none;
      background-clip: padding-box;
      border-radius: 4px;
      outline: none;
      -webkit-box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
      box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
      z-index: 2021;

      .input-wrap {
        height: 28px;
        padding: 2px 0px;
        .modInput {
          height: 23px;
          border: none;
          outline: none;
          box-shadow: none;
        }
      }

      .btnBox {
        display: flex;
        height: 40px;
        line-height: 40px;
        padding: 0px 10px;

        .left {
          width: 20px;
          cursor: pointer;
        }

        .mid {
          flex: 1;
          font-weight: 500;
          text-align: center;
        }

        .right {
          width: 20px;
          text-align: right;
          cursor: pointer;
        }
      }

      .listBox {
        ul {
          display: flex;
          flex-wrap: wrap;
          padding-left: 0;
          li {
            width: 33.3%;
            line-height: 54px;
            text-align: center;
            list-style: none inside;

            span {
              display: inline-block;
              height: 24px;
              margin: 0 auto;
              padding: 0 8px;
              line-height: 24px;
              text-align: center;
              background: transparent;
              border-radius: 2px;
              cursor: pointer;
            }
          }
        }
      }
    }
  }
}

.anticon-calendar {
  color: rgba(0, 0, 0, 0.25);
}

[data-wpg-theme='knight-dark'],
[data-wpg-theme='foggy-dark'],
[data-wpg-theme='light'] {
  .yearDate {
    .wfc2 {
      color: #666;
    }
    .year-content-wrap {
      .chooseBox {
        border: 1px solid #dee2e7;
        .input-wrap {
          background: #fff;
          .modInput {
            color: #333;
            background: #fff;
          }
        }

        .btnBox {
          border-top: 1px solid #dee2e7;
          border-bottom: 1px solid #dee2e7;
        }

        .listBox {
          ul {
            li {
              span {
                &:hover {
                  color: #4285f4;
                  background: #f1f6fd;
                }
              }

              .active {
                color: #fff;
                background: #4285f4;
              }

              .dis-color {
                color: #c0c0c0;
                background: #f5f5f5;
                cursor: not-allowed;
                &:hover {
                  color: #c0c0c0;
                  background: #f5f5f5;
                }
              }
            }
          }
        }
      }
    }
  }
}

[data-wpg-theme='dark'] {
  .yearDate {
    .wfc2 {
      color: #adb5bd;
    }
    .year-content-wrap {
      .chooseBox {
        border: 1px solid #303942;

        .input-wrap {
          background: #20262f;
          .modInput {
            color: #fff;
            background: #12161d;
          }
        }

        .btnBox {
          border-top: 1px solid #303942;
          border-bottom: 1px solid #303942;
        }

        .listBox {
          ul {
            li {
              span {
                &:hover {
                  color: #71a3f8;
                  background: #2b333f;
                }
              }

              .active {
                color: #fff;
                background: #4285f4;
              }

              .dis-color {
                color: #495057;
                background: #1b2027;
                cursor: not-allowed;
                &:hover {
                  color: #495057;
                  background: #1b2027;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
