<template>
  <section>
    <div class="right-content">
      <header class="wbgc-card wbr-4">
        <h3>内容配置</h3>
      </header>
      <w-info-table
        :columns="columns"
        :data-source="subTypeList"
        showIndex
        :loading="subTypeLoading"
        @info="handleViewInfo"
        class="wbgc-card"
      >
        <template #typeRemarks="{ text, row }">
          <div class="edit-wrapper">
            <span class="ellipsis">{{ text }}</span>
            <w-icon type="edit" class="wfc-theme" @click="handleChangeRemark(row)" />
          </div>
        </template>
      </w-info-table>
    </div>
  </section>
</template>

<script>
import { columns } from '../dynamic-config.js';
export default {
  name: 'DynamicConfig',
  data() {
    return {
      // 配置类分类
      typeList: [],
      subTypeList: [],
      selectedKeys: [],
      subTypeLoading: false,
      loading: false,
      columnsConfig: columns,
      columns: []
    };
  },
  computed: {
    code() {
      return this.$route?.meta?.menuJson?.code;
    }
  },
  watch: {
    code(val) {
      this.getSubTypeByCode(val);
    }
  },
  mounted() {
    this.columns =
      process.env.NODE_ENV !== 'production'
        ? this.columnsConfig
        : [...this.columnsConfig.slice(0, 1), ...this.columnsConfig.slice(2)];

    this.init();
  },
  methods: {
    init() {
      if (this.code) {
        this.getSubTypeByCode(this.code);
      }
    },
    /**
     * 根据配置类code获取详细分类
     */
    async getSubTypeByCode(code) {
      try {
        this.subTypeLoading = true;
        const { resultData } = await this.$axios.post('/waterwork-sys-api/ConfigureType/list', {
          groupCode: `${this.$store.state.user.info.tenantCode}_${code}`,
          pageFlag: false
        });
        if (code === 'yjsg') {
          this.subTypeList = resultData?.filter(
            v => v.originCode !== 'medicamentAssayTemplateCode'
          );
        } else {
          this.subTypeList = Object.freeze(resultData);
        }
      } catch (error) {
        console.log('error', error);
        this.subTypeList = Object.freeze([]);
      } finally {
        this.subTypeLoading = false;
      }
    },
    handleViewInfo(row) {
      window.sessionStorage.setItem('dynamic-config', JSON.stringify(row));
      this.goto({
        path: '/DynamicConfig/detail',
        query: {
          typeCode: row.typeCode,
          // typeId: row.id
          originCode: row.originCode
        }
      });
    },
    handleChangeRemark(row) {
      const rawText = row.typeRemarks;
      this.$confirm({
        title: '修改备注信息',
        content: (
          <w-textarea
            v-model={row.typeRemarks}
            maxLength={500}
            autoSize={{
              minRows: 3,
              maxRows: 12
            }}
          ></w-textarea>
        ),
        type: 'info',
        cancelText: '取消',
        centered: true,
        class: 'type-remark',
        onOk: async () => {
          await this.$axios.post('/waterwork-sys-api/ConfigureType/update', {
            ...row
          });
          this.init();
          this.$message.success('操作成功');
        },
        onCancel() {
          row.typeRemarks = rawText;
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
section {
  width: 100%;
  height: 100%;
  display: flex;

  aside {
    flex: 180px 0 0;
    margin: -12px 0 0 -10px;
  }

  .right-content {
    flex-grow: 1;
    display: flex;
    flex-flow: column nowrap;
    // padding-left: 10px;

    header {
      height: 54px;
      display: flex;
      align-items: center;
      padding: 0 24px;
      flex: 54px 0 0;
      justify-content: space-between;
    }
    .info-table-view {
      height: calc(100% - 66px);
      margin-top: 12px;
      min-height: 0;

      .edit-wrapper {
        display: flex;
        > span {
          flex: 1;
          margin-right: 12px;
        }
      }
    }
  }
}
</style>
<style lang="less">
.type-remark.wpg-modal-confirm.wpg-modal-confirm-with-btns {
  .wpg-modal-body {
    padding: 24px;
    .wpg-modal-confirm-content {
      width: 100%;
    }
  }
}
</style>
