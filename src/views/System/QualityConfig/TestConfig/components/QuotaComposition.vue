<template>
  <div class="outer-wrap full-view">
    <div class="compo-wrap shadow-card wbgc-card full-view">
      <div class="compo-head">
        <div class="em-title" style="font-size: 14px">水质指标组合</div>
        <w-button type="primary" @click="addComposition"
          ><w-icon type="ic_add"></w-icon>新增组合</w-button
        >
      </div>
      <div class="compo-factory">
        <span>选择污水厂：</span>
        <factory-select
          showAll
          autoSelect
          v-model="waterPlantId"
          style="flex: 1"
          @change="getCompoList"
        ></factory-select>
      </div>
      <w-divider></w-divider>
      <div class="compo-menu-wrap">
        <w-menu mode="inline" v-model="compoIdList" @select="selectCompoType">
          <w-menu-item
            class="menu-items"
            v-for="item in list"
            :key="item.id"
            :title="item.showName"
          >
            <div class="item-name">{{ item.showName }}</div>
            <div v-show="item.id === compoIdList[0]">
              <w-button type="link" class="item-btn" @click="compoDelete(item)"
                ><w-icon type="ic_delete"></w-icon
              ></w-button>
              <w-button type="link" class="item-btn" @click="compoEdit(item)"
                ><w-icon type="ic_border_color"></w-icon
              ></w-button>
            </div>
          </w-menu-item>
        </w-menu>
      </div>
    </div>
    <div class="compo-info-wrap shadow-card wbgc-card full-view">
      <div class="tip-head">
        <div>
          <span class="tip-title">当前指标组合：</span>
          <span class="tip-name">{{ compoTitle }}</span>
        </div>
        <div class="tip-info">
          水质指标组合即多个水质指标的集合，如“进水水质日检”，方便快速配置化验项。
        </div>
      </div>
      <w-form-table-page>
        <template #form>
          <w-form-header
            :fields="quotaFields"
            :model="searchForm"
            :layout="headerLayout"
            :title="null"
            :loading="loading"
            newLine
            :neddRetain="false"
          >
            <template #footer>
              <w-button type="primary" style="margin-left: 8px" @click="bindQuota"
                ><w-icon type="ic_add"></w-icon>绑定水质指标</w-button
              >
              <w-button icon="reload" @click="resetPageChange">
                <span>重置</span>
              </w-button>
              <w-button type="primary" icon="ic_search" @click="getList">
                <span>查询</span>
              </w-button>
            </template>
          </w-form-header>
        </template>
        <template #table>
          <w-info-table
            v-loading="loading"
            showIndex
            :columns="quotaColumns"
            :data-source="data"
            :page="searchForm"
            :scroll="{ x: 800 }"
            @changePage="handlePageChange"
          >
            <template #action="{ text, row }">
              <w-button
                icon="delete"
                type="link"
                @click="quotaDelete(text, row)"
                style="font-size: 13px"
                >移除指标</w-button
              >
            </template>
          </w-info-table>
        </template>
      </w-form-table-page>
    </div>
    <AddModal
      mode="Composition"
      :title="addTitle"
      :visible.sync="addVisible"
      :outerForm="compoForm"
      :outerList="list"
      :waterPlantId="waterPlantId"
      @getInit="getInit"
    />
    <BindQuota
      :visible.sync="bindVisible"
      :compoId="compoIdList[0]"
      :compoTitle="compoTitle"
      @getList="getList"
    />
  </div>
</template>

<script>
import FactorySelect from '@/components/factory-select';
import AddModal from '@/views/System/QualityConfig/TestConfig/Modals/AddModal';
import BindQuota from '@/views/System/QualityConfig/TestConfig/Modals/BindQuota';
import { quotaFields, headerLayout, quotaColumns } from './config.js';
import mixin from './mixin';
export default {
  name: 'QuotaComposition',
  inject: ['state'],
  components: { FactorySelect, AddModal, BindQuota },
  mixins: [mixin],
  data() {
    return {
      // 指标组合目录
      list: [],
      compoIdList: [],
      compoTitle: '',
      // 头部
      quotaFields,
      headerLayout,
      waterPlantId: undefined,
      // 表格
      quotaColumns,
      data: [],
      searchForm: {
        nameLike: '',
        // 分页
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      page: { size: 20, pages: 1, total: 0 },
      // 新增组合弹窗
      addVisible: false,
      addTitle: '新增水质指标组合',
      compoForm: {},
      // 绑定指标弹窗
      bindVisible: false
    };
  },
  watch: {
    'state.theme'() {
      this.setColor();
    }
  },
  created() {
    this.quotaFields[0].listeners = { pressEnter: this.getList };
  },
  methods: {
    setColor() {
      let element = document
        .getElementsByClassName('compo-head')[0]
        .getElementsByClassName('wpg-btn-primary')[0];
      let bgColor = window.getComputedStyle(element).backgroundColor;
      document.body.style.setProperty('--master-theme', bgColor);
      document.body.style.setProperty(
        '--master-theme-background',
        `rgba(${bgColor.slice(4, -1)}, 0.1)`
      );
    },
    async resetPageChange() {
      this.searchForm.currentPage = 1;
      this.searchForm.pageSize = 20;
      this.page.pages = 1;
      this.page.size = 20;
      this.searchForm.nameLike = '';
      await this.getList();
    },
    getInit() {
      this.setColor();
      this.quotaFields[0].listeners = { pressEnter: this.getList };
      this.getCompoList();
    },
    // 左侧指标组合
    async getCompoList() {
      const { resultData } = await this.$http.post('/indexCombination/list', {
        waterPlantId: this.waterPlantId,
        pageFlag: false
      });

      this.list = resultData;
      this.compoIdList = this.list.length ? [this.list[0].id] : [];
      this.compoTitle = this.list.length ? this.list[0].name : '';
      await this.getList();
    },
    async selectCompoType(item) {
      this.compoIdList = item.selectedKeys;
      this.compoTitle = this.list.find(v => v.id === item.key)?.name || '';
      await this.getList();
    },
    addComposition() {
      this.addVisible = true;
      this.addTitle = '新增水质指标组合';
      this.compoForm = {};
    },
    compoEdit(item) {
      this.addVisible = true;
      this.addTitle = '编辑水质指标组合';
      this.compoForm = item;
    },
    compoDelete(item) {
      this.$confirm({
        title: '删除后化验工单将无法再使用该指标组合，您确定要删除该组合吗？',
        okText: '确定删除',
        cancelText: '取消',
        onOk: async () => {
          // 删除指标组合，同时该指标组合在化验模板中消失
          // 但如果之前选择的该组合全部或部分水质指标项仍保留
          await this.$http.delete(`/indexCombination?id=${item.id}`);
          this.getInit();
        },
        onCancel: () => {}
      });
    },
    // 右侧水质指标
    bindQuota() {
      this.bindVisible = true;
    },
    async getList() {
      this.loading = true;
      const { resultData } = await this.$http.post(
        `/indexCombination/page?indexCombinationId=${this.compoIdList[0]}`,
        {
          page: this.page,
          ...this.searchForm
        }
      );

      this.data = resultData.records;
      this.searchForm.total = resultData.total;
      this.page.total = resultData.total;
      this.loading = false;
    },
    handlePageChange(cur, size) {
      this.searchForm.currentPage = cur;
      this.searchForm.pageSize = size;
      this.page.pages = cur;
      this.page.size = size;
      this.getList();
    },
    quotaDelete(text, row) {
      this.$confirm({
        title: '您确定要将该指标从当前组合中移除吗？',
        okText: '确定移除',
        cancelText: '取消',
        onOk: async () => {
          // 该指标从指标组合中消失，在化验模板中当前指标组合中该指标也消失
          // 但如果之前选择了当前组合中的该水质指标仍保留
          await this.$http.post('/indexCombination/removeRelation', {
            indexCombinationId: this.compoIdList[0],
            indexId: row.id
          });
          this.getList();
        },
        onCancel: () => {}
      });
    }
  }
};
</script>
<style lang="less" scoped>
.outer-wrap {
  padding: 0 0 10px 20px;
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.compo-wrap {
  width: 280px;
  padding: 10px 0;
  overflow: hidden;

  > *:not(.compo-menu-wrap) {
    padding-left: 20px;
    padding-right: 20px;
  }

  .compo-menu-wrap {
    overflow: hidden scroll;
    height: calc(100% - 105px);
    width: calc(100% + 8px);

    /deep/ .wpg-menu-root {
      width: 100%;
    }

    /deep/ .item-name {
      width: calc(100% - 60px);
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &::-webkit-scrollbar-track {
      background-color: transparent;
    }
  }

  .menu-items {
    display: flex;
    justify-content: space-between;
    align-content: center;

    .item-btn {
      padding: 0 2px;
    }
  }
}

.compo-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.compo-factory {
  display: flex;
  align-items: center;
}

/deep/ .wpg-menu-item {
  padding: 0;
  border-left: 2px solid transparent;
}

/deep/.wpg-menu-inline,
.wpg-menu-vertical,
.wpg-menu-vertical-left {
  border: none !important;
}

.compo-info-wrap {
  width: calc(100% - 300px);
  padding: 10px 20px;

  .wbgc-card {
    box-shadow: none;
  }

  /deep/ .wpg-form-table-warp {
    height: calc(100% - 70px);
  }

  /deep/ .wpg-form-table-warp .table-warp {
    box-shadow: none;
    padding: 0;
  }
  //解决field名称大于六个字显示不全的问题
  /deep/.wpg-info-form .wpg-form-item.label-auto .wpg-form-item-label {
    flex-basis: 100px;
  }
}

.tip-head {
  padding: 0 20px;
  font-size: 14px;
  margin-bottom: 15px;
  > * {
    margin: 4px 0;
  }
  .tip-compo {
    color: #666666;
  }
  .tip-name {
    color: #333333;
  }
  .tip-info {
    color: #999999;
    &::before {
      display: inline-block;
      margin-right: 4px;
      color: #f64357;
      font-size: 14px;
      line-height: 1;
      content: '*';
    }
  }
}

/deep/ .wpg-col-6 .wpg-form-item-label {
  overflow: visible;
}

/deep/ .wpg-col-18 .wpg-form-item-control {
  margin-left: 12px;
}

.em-title {
  line-height: 14px;
}

body {
  --master-theme: transparent;
  --master-theme-background: transparent;
}

/deep/ .wpg-menu:not(.wpg-menu-horizontal) .wpg-menu-item-selected {
  color: var(--master-theme) !important;
  background-color: var(--master-theme-background);
  border-left: 2px solid var(--master-theme);
}

/deep/ .wpg-menu-item-selected .wpgicon,
.wpg-menu-submenu-title-selected .wpgicon {
  color: var(--master-theme) !important;
}
</style>
