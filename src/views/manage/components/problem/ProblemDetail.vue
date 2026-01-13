<template>
  <div class="alarm-detail-con">
    <div class="body-block">
      <div class="item-block">
        <div class="block__title">
          <Title>基本信息</Title>
        </div>
        <div class="block-content">
          <div class="block__info">
            <div class="content__head">
              <div class="content__left">
                <span v-if="detailData.severityName" class="content__serious">
                  {{ detailData.severityName || '--' }}
                </span>
                <span class="content__pump">{{ detailData.pumpHouseName || '--' }}</span>
              </div>
              <span class="content__time">{{ detailData.createTime || '--' }}</span>
            </div>
            <div class="content__info">
              <div class="content__text">{{ detailData.problemContent || '--' }}</div>
              <div class="content__radio"></div>
            </div>
            <div class="content__bottom">
              <div class="content__addr">{{ detailData.pumpAddress || '--' }}</div>
              <div class="content__status">{{ detailData.statusName || '--' }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="item-block">
        <div class="block__title">
          <Title>现场情况</Title>
          <div class="report-user">上报人：{{ detailData.createByName || '--' }}</div>
        </div>
        <div class="block-content">
          <div class="content__picture">
            <img-slider :imgList="detailData.files" :editPermission="false" />
          </div>
        </div>
      </div>
      <div class="item-block">
        <div class="block__title">
          <Title>写留言</Title>
          <span v-if="isCommentEdit">
            <span class="comment__delete" @click="isCommentEdit = false">取消</span>
            <span class="comment__send" @click="problemCommentAdd">发送</span>
          </span>
        </div>
        <div class="block-content">
          <div v-show="!isCommentEdit" class="comment-list">
            <div class="comment-list__item" v-for="(item, index) in commentList" :key="item.id">
              <div class="item__left">
                <div class="item__icon">
                  <img :src="item.photos ? baseImgApi + item.photos : defaultAvatar" alt="" />
                </div>
                <div class="item__content">
                  <div class="item__person">
                    <span class="person__name">{{ item.userName || '--' }}</span>
                    <span v-if="item.roleName" class="person__post">
                      {{ item.roleName.split(',')[0] || '--' }}
                    </span>
                    <span class="item__time">{{ item.commentTime || '--' }}</span>
                  </div>
                  <span v-if="item.status" class="item__comment">{{ item.comment || '--' }}</span>
                  <div v-else>
                    <span class="item__comment--delete">内容已删除</span>
                  </div>
                </div>
              </div>
              <div v-if="item.status" class="item__right">
                <span class="comment__delete" @click="problemCommentDelete(item.id)">删除</span>
              </div>
            </div>
          </div>

          <w-textarea
            :max-length="100"
            v-show="isCommentEdit"
            v-model="commentData"
            placeholder="发表你的意见吧"
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </div>
      </div>
    </div>
    <div class="foot-block">
      <w-button @click="toForward()">转发</w-button>
      <w-button @click="toMessage()">留言</w-button>
      <w-button type="primary" @click="toDispatch()">派单</w-button>
    </div>
    <drag-modal
      ref="forwardDetail"
      :isShowFullBtn="false"
      :mask="true"
      :width="560"
      :height="280"
      title="转发"
    >
      <div class="forward__box">
        <w-form-model layout="horizontal" style="width:100%">
          <w-row type="flex" align="middle">
            <w-col :span="24">
              <w-form-model-item
                label="选择人员"
                :labelCol="{ span: 5 }"
                :wrapperCol="{ span: 17, offset: 1 }"
              >
                <w-select
                  v-model="reportPerson"
                  mode="multiple"
                  :filterOption="false"
                  :options="renderedOptions"
                  placeholder="请选择\输入"
                  style="width: 100%"
                  :maxTagTextLength="4"
                  maxTagPlaceholder="..."
                  :maxTagCount="3"
                  dropdownClassName="supervise-set-select"
                  @search="handleSearch"
                  @popupScroll="handleScroll"
                  @select="handleSelect"
                  @dropdownVisibleChange="dropDownSelect"
                ></w-select>
              </w-form-model-item>
            </w-col>
            <w-col :span="24">
              <w-form-model-item :labelCol="{ span: 6 }" :wrapperCol="{ span: 17, offset: 1 }">
                <div class="query-wrapper">
                  <w-button class="supply-mx-1" type="primary" @click="handleForward()"
                    >确定</w-button
                  >
                  <w-button class="supply-mx-1" @click="handleForward(false)">取消</w-button>
                </div>
              </w-form-model-item>
            </w-col>
          </w-row>
        </w-form-model>
      </div>
    </drag-modal>
  </div>
</template>

<script>
import serverConfig from '@/config/server.config';
import debounce from 'lodash/debounce';
import Title from './Title';
import {
  problemCommentAdd,
  problemCommentDelete,
  problemCommentList,
  problemReportForward, //问题转发
  problemReportUserTarget
} from '@/api/manage';
import DragModal from '@/components/DragModal';
const LOAD_NUM = 20; // 加载条数--可自定义
export default {
  name: 'ProblemDetail',
  props: {
    detailData: {
      type: Object,
      default: () => ({})
    },
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  data() {
    this.handleScroll = debounce(this.handlePopupScroll, 150);
    return {
      keyword: '',
      renderedOptions: [],
      pointsList: [],
      filterDataList: [],
      loading: false,
      rules: {
        input: [
          {
            max: 4
          },
          { required: true, message: '该选项必填' },
          { validator: this.validatePass, tirgger: 'change' }
        ]
      },
      rule: { max: 4 },
      total: 0,
      page: { current: 1, size: 10 },
      defaultAvatar: require('@/assets/images/default/order/default_avatar.png'),
      isCommentEdit: false,
      commentData: '',
      commentList: [],
      reportPerson: [],
      baseImgApi: serverConfig.IMG_BASE_URL
    };
  },

  components: { Title, DragModal, ImgSlider: () => import('./ImgSlider.vue') },

  computed: {},

  mounted() {
    this.problemCommentList();
    this.problemReportUserTarget();
    this.scrollLoadRank();
  },

  methods: {
    // 滚动时触发（防止抖动）
    handlePopupScroll() {
      if (this.keyword === '') {
        this.loadMoreData(this.pointsList);
      } else {
        this.loadMoreData(this.filterDataList);
      }
    },
    dropDownSelect(open) {
      this.renderedOptions = open ? this.pointsList.slice(0, LOAD_NUM) : this.pointsList;
    },
    // 被选中时调用，参数为选中项的 value (或 key) 值
    handleSelect(val) {
      if (this.keyword) {
        const selectedArr = this.pointsList.filter(item => item === val); // 从数据源中过滤出下拉框选中的值，并返回一个数组
        const restList = this.pointsList.filter(item => item !== val); // 从数据源中过滤出其他的值，返回一个数组
        const newList = selectedArr.concat(restList).slice(0, LOAD_NUM); // 将选中的元素放到下拉列表的第一位
        this.renderedOptions = newList; // 更新已渲染的下拉列表
        this.pointsList = selectedArr.concat(restList); // 更新数据源
        this.keyword = ''; // 因为触发handleSelect函数时，会自动清空用户输入的内容。因此，keyword需要重置。
      }
    },
    // 文本框值变化时触发 -- 从数据源中过滤出含搜索内容的数据，并取过滤结果的前n条作为下拉列表的可选项
    handleSearch(val) {
      this.keyword = val;
      let filterList = [];
      if (val) {
        filterList = this.pointsList.filter(item => {
          let value = item.label;
          return value.indexOf(val) > -1;
        });
      } else {
        filterList = this.pointsList;
      }
      this.filterDataList = filterList;
      this.renderedOptions =
        filterList.length < LOAD_NUM ? filterList : filterList.slice(0, LOAD_NUM);
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
    alidatePass(rule, value, callback) {
      if (!value) {
        callback(new Error('请输入密码'));
      }
      // callback()
    },
    scrollLoadRank() {
      this.$nextTick(() => {
        const itemDom = document.querySelector('.comment-list');
        itemDom.addEventListener('scroll', () => {
          if (this.loading) return;
          if (this.commentList.length === this.total) return;
          if (parseInt(itemDom.scrollHeight - itemDom.scrollTop - 5) <= itemDom.clientHeight) {
            this.problemCommentList(true);
          }
        });
      });
    },
    async handleForward(isSure = true) {
      if (isSure) {
        let res = await problemReportForward(this.detailData.id, this.reportPerson);
        if (res.success) {
          this.$message.success('转发成功');
        }
      }
      this.$refs.forwardDetail.visible = false;
    },
    async toForward() {
      this.$refs.forwardDetail.visible = true;
    },
    async problemReportUserTarget() {
      let res = await problemReportUserTarget(this.waterPlantId, 2, this.detailData.id);
      if (res.status === 'complete') {
        this.pointsList = res.resultData.map(p => {
          return {
            label: p.userName,
            value: p.id,
            key: p.id
          };
        });
        this.renderedOptions = this.pointsList;
      }
    },
    async problemCommentAdd() {
      if (this.commentData.length) {
        await problemCommentAdd({
          channel: 2,
          problemId: this.detailData.id,
          comment: this.commentData
        });

        this.problemCommentList();
        this.isCommentEdit = false;
      } else {
        this.$message.warn('请先填写留言内容');
      }
    },
    async problemCommentDelete(id) {
      let res = await problemCommentDelete(id);
      if (res.status === 'complete') {
        this.$message.success('删除成功');
        this.problemCommentList();
      }
    },
    async problemCommentList(scroll = false) {
      this.loading = true;
      if (!scroll) {
        this.page = { current: 1, size: 10 };
      } else {
        this.page = { ...this.page, current: this.page.current + 1 };
      }
      let res = await problemCommentList(this.page, this.detailData.id);

      if (!scroll) {
        this.commentList = [...res.resultData];
      } else {
        this.commentList = [...this.commentList, ...res.resultData];
      }
      this.total = res.count;
      this.loading = false;
    },
    toMessage() {
      this.commentData = '';
      this.isCommentEdit = true;
    },
    toDispatch() {
      this.$emit('toDispatch');
    }
  }
};
</script>
<style lang="less" scoped>
.forward__box {
  padding: 20px 27px 20px 0;
  .query-wrapper {
    margin-left: 100px;
  }
}
.alarm-detail-con {
  padding: 12px 18px;
  overflow-y: auto;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .body-block {
    flex-direction: column;
    display: flex;
    width: 100%;

    .item-block {
      padding-bottom: 20px;
      .block__title {
        padding-bottom: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .report-user {
          font-weight: 400;
          font-size: 14px;
          color: #646666;
          text-align: right;
          line-height: 18px;
        }
        .comment__delete {
          cursor: pointer;
          margin-right: 20px;
          font-weight: 400;
          font-size: 14px;
          color: #969999;
          letter-spacing: 0;
          text-align: right;
        }
        .comment__send {
          cursor: pointer;
          font-weight: 400;
          font-size: 14px;
          color: var(--supply-color-primary-DEFAULT);
          letter-spacing: 0;
          text-align: right;
        }
      }
      .block-content {
        .block__info {
          padding: 12px 16px;

          border: 1px solid #dce0df;
          .content__head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            .content__left {
              .content__serious {
                margin-right: 8px;
                width: 34px;
                height: 16px;
                background: #ffdbdd;
                border-radius: 1px;
                font-weight: 400;
                font-size: 11px;
                color: #f34c52;
                text-align: center;
                line-height: 16px;
                padding: 0 6px;
              }
              .content__pump {
                font-weight: 500;
                font-size: 14px;
                color: #323333;
                letter-spacing: 0;
              }
            }
            .content__time {
              font-weight: 400;
              font-size: 14px;
              color: #969999;
              letter-spacing: 0;
              text-align: right;
            }
          }
          .content__info {
            .content__text {
              margin-bottom: 16px;
              font-weight: 500;
              font-size: 16px;
              color: #323333;
              letter-spacing: 0;
            }
          }
          .content__bottom {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .content__addr {
              font-weight: 400;
              font-size: 14px;
              color: #646666;
              letter-spacing: 0;
            }
            .content__status {
              font-weight: 400;
              font-size: 14px;
              color: var(--supply-color-primary-DEFAULT);
              letter-spacing: 0;
              text-align: right;
            }
          }
        }
        .content__picture {
          height: 152px;
        }
        .comment-list {
          overflow-y: auto;
          max-height: 200px;
          &__item {
            border-bottom: 1px solid #dce0df;
            min-height: 72px;
            padding: 12px 0;
            display: flex;
            justify-content: space-between;

            .item__left {
              flex: 1;
              display: flex;
              .item__icon {
                width: 57px;
                height: 48px;
                border-radius: 4px;
                > img {
                  width: 48px;
                }
              }
              .item__content {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                width: calc(100% - 60px);
                .item__person {
                  line-height: 24px;
                  vertical-align: middle;
                  .person__name {
                    margin-right: 12px;
                    font-weight: 500;
                    font-size: 16px;
                    color: #323333;
                    letter-spacing: 0;
                  }
                  .person__post {
                    margin-right: 20px;
                    padding: 1px 6px;
                    background: #18c68a;
                    border-radius: 1px;
                    font-weight: 400;
                    font-size: 12px;
                    color: #ffffff;
                    text-align: center;
                    vertical-align: middle;
                    line-height: 16px;
                  }
                }
                .item__comment {
                  font-weight: 400;
                  font-size: 14px;
                  color: #323333;
                  letter-spacing: 0;
                  &--delete {
                    padding: 0 6px;
                    border-radius: 2px;
                    background-color: rgb(215, 215, 215);
                  }
                }
                .item__time {
                  font-weight: 400;
                  font-size: 14px;
                  color: #969999;
                }
              }
            }
            .item__right {
              flex: 0 0 auto;
              font-weight: 400;
              font-size: 14px;
              color: var(--supply-color-primary-DEFAULT);
              text-align: right;
              align-self: end;
              .comment__delete {
                cursor: pointer;
                margin-right: 20px;
              }
              .comment__edit {
                cursor: pointer;
              }
            }
          }
        }
      }
    }
  }

  .foot-block {
    text-align: right;

    .wpg-btn {
      margin: 10px 0 10px 10px;
    }
  }
}
</style>
