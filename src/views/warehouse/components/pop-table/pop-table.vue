<template>
  <w-popover
    class="pop-table"
    trigger="hover"
    :placement="placement"
    :width="width"
    @visibleChange="handleShow"
  >
    <!-- <template v-for="slot in Object.keys($scopedSlots)" :slot="slot" slot-scope="scope">
      <slot :name="slot" v-bind="scope" />
    </template> -->
    <a href="javascript:;">{{ hoverTxt }}</a>
    <template slot="content">
      <div class="pop-table__inner ivu-mt-8">
        <w-table
          :loading="loading"
          :columns="columns"
          :data-source="data"
          :height="tableHeight"
          :pagination="pagination"
          @change="handleChangePage"
          size="small"
        ></w-table>
        <!-- <div style="overflow: hidden" class="ivu-pt-8">
          <div style="float: right">
            <Page
              :total="dataTotal"
              size="small"
              :page-size="pageSize"
              :current.sync="current"
              @on-change="handleChangePage"
            />
          </div>
        </div> -->
      </div>
    </template>
  </w-popover>
</template>

<script>
  // import { popover } from 'ant-design-vue';
  export default {
    name: 'PopTable',
    // components: {
    //   'w-popover': popover
    // },
    props: {
      placement: {
        type: String,
        default: 'right'
      },
      hoverTxt: {
        type: String,
        default: ''
      },
      relatedData: Object,
      columns: Array,
      getDataPromise: {
        type: Function,
        default: null
      },
      // 数据空时候，表格高度
      tableHeight: {
        type: Number,
        default: 250
      },
      width: {
        type: Number,
        default: 400
      },
      minHeight: Number,
      total: {
        type: Number,
        default: 0
      },
      pageSize: {
        type: Number,
        default: 5
      },
      pageIndex: {
        type: Number,
        default: 1
      }
    },
    watch: {
      relatedData() {
        this.init = 0
        // this.handleShow()
      },
      current(val) {
        this.$emit('update:pageIndex', val)
      },
      total(val) {
        this.dataTotal = val
      }
    },
    data() {
      return {
        init: 0,
        loading: true,
        dataTotal: this.total,
        current: this.pageIndex,
        pagination: {},
        data: []
      }
    },
    created() {
      console.log(this.$scopedSlots)
    },
    methods: {
      handleChangePage() {
        this.$nextTick(() => {
          this.getData()
        })
      },
      async getData() {
        this.loading = true
        const data = await this.getDataPromise(
          this.current,
          this.pageSize,
          this.relatedData
        )
        this.loading = false
        this.dataTotal = data.totalCount
        this.data = data.items
      },
      async handleShow(visible) {
        if (visible && this.init === 0) {
          this.init = 1
          try {
            await this.getData()
            this.init = 2
          } catch (error) {
            this.loading = false
            this.init = 0
          }
        }
      }
    }
  }
</script>

<style lang="less">
.pop-table {
  &__inner {
    .ivu-table-body {
      overflow-x: hidden;
    }
    .ivu-table:before {
      background: inherit;
    }
    // .ivu-table-tip table td {
    //   background: #fff;
    //   &:hover {
    //     background: #fff;
    //   }
    // }
    // tr.ivu-table-row td {
    //   background: #fff;
    // }

    // tr.ivu-table-row-hover td {
    //   background: #ebf7ff;
    // }
  }
}
</style>
