import './index.less';
import T from '@wpg/design-vue/es/table/Table';
import AutoSizeTable from '@/components/AutoSizeTable';
import get from 'lodash.get';
import debounce from 'lodash.debounce';
import {
  genColumnKey,
  onRestore,
  isBoolean,
  isString,
  baseGet,
  on,
  off,
  triggerWindowResize
} from './util';
import ColumnSetting from './components/ColumnSetting';
import TableTitle from './components/TableTitle';

export default {
  name: 'STable',
  data() {
    return {
      needTotalList: [],

      selectedRows: [],
      selectedRowKeys: [],

      localLoading: false,
      localDataSource: [...this.dataSource],
      localPagination: {
        showQuickJumper: false,
        showSizeChanger: true,
        showTotal: total => `共${total}条`,
        pageSizeOptions: ['10', '20', '50'],
        ...this.pagination
      },
      localScroll: { ...this.scroll },

      columnsMap: { ...this.columnsStateMap },
      localColumns: [...this.columns]
    };
  },
  props: {
    ...T.props,
    title: {
      type: [Function, String]
    },
    rowKey: {
      type: [String, Function],
      default: 'key'
    },
    data: {
      type: Function,
      required: false
    },
    dataKeys: {
      type: Object,
      required: false,
      default() {
        return {
          total: 'total',
          records: 'records',
          current: 'current'
        };
      }
    },
    pageNum: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 20
    },
    showSizeChanger: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      default: 'default'
    },
    localColumnKey: {
      type: String,
      default: ''
    },
    initLoadData: {
      type: Boolean,
      default: true
    },
    canResize: {
      type: Boolean,
      default: true
    },
    maxHeight: {
      type: Number
    },
    resizeHeightOffset: {
      type: Number,
      default: 0
    },
    /**
     * alert: {
     *   show: true,
     *   clear: Function
     * }
     */
    alert: {
      type: [Object, Boolean],
      default: null
    },
    rowSelection: {
      type: Object,
      default: null
    },
    /** @Deprecated */
    showAlertInfo: {
      type: Boolean,
      default: false
    },
    showPagination: {
      type: String | Boolean,
      default: 'auto'
    },
    /**
     * enable page URI mode
     *
     * e.g:
     * /users/1
     * /users/2
     * /users/3?queryParam=test
     * ...
     */
    pageURI: {
      type: Boolean,
      default: false
    },

    options: {
      type: Boolean | Object,
      default: false
    },
    columnsStateMap: {
      type: Object,
      default: null
    },
    filterTableRow: {
      type: [Function, Object],
      default: null
    }
  },
  computed: {
    getCanResize() {
      const { canResize, scroll } = this;

      return canResize && !(scroll || {}).y;
    }
  },
  watch: {
    'localPagination.current'(val) {
      this.pageURI &&
        this.goto({
          ...this.$route,
          name: this.$route.name,
          params: { ...this.$route.params, pageNo: val }
        });
      // change pagination, reset total data
      this.needTotalList = this.initTotalList(this.columns);
      this.selectedRowKeys = [];
      this.selectedRows = [];
    },
    pageNum(val) {
      Object.assign(this.localPagination, {
        current: val
      });
    },
    pageSize(val) {
      Object.assign(this.localPagination, {
        pageSize: val
      });
    },
    showSizeChanger(val) {
      Object.assign(this.localPagination, {
        showSizeChanger: val
      });
    },
    columns() {
      this.localColumns = [...this.columns];
    },
    loading() {
      this.localLoading = this.loading;
    }
  },
  created() {
    const { pageNo } = this.$route.params;
    const localPageNum = (this.pageURI && pageNo && parseInt(pageNo, 10)) || this.pageNum;
    this.localPagination =
      (['auto', true].includes(this.showPagination) && {
        ...this.localPagination,
        current: localPageNum,
        pageSize: this.pageSize,
        showSizeChanger: this.showSizeChanger
      }) ||
      false;
    this.needTotalList = this.initTotalList(this.columns);
    let localColumns = onRestore(this.localColumnKey);
    if (localColumns) {
      this.onColumnsChange(localColumns);
    }
    this.initLoadData && this.data && this.loadData();
  },

  mounted() {
    if (this.getCanResize) {
      // this.calcTableHeight();

      // const hasFixedLeft = (this.columns || []).some(item => item.fixed === 'left');
      // TODO antv table问题情况太多，只能先用下面方式定时器hack
      // setTimeout(() => {

      // }, 100);
      this.calcTableHeight(() => {
        // 有左侧固定列的时候才有问题
        // hasFixedLeft &&
        setTimeout(() => {
          triggerWindowResize();
        }, 100);
      });

      this.__resizeHandler = debounce(
        () => {
          this.calcTableHeight();
        },
        100,
        { leading: true }
      );

      on(window, 'resize', this.__resizeHandler);
    }
  },
  beforeDestroy() {
    if (this.getCanResize) {
      off(window, 'resize', this.__resizeHandler);
    }
  },
  methods: {
    /**
     * 表格重新加载方法
     * 如果参数为 true, 则强制刷新到第一页
     * @param Boolean bool
     */
    refresh(bool = false) {
      if (bool) {
        this.localPagination = {
          ...this.localPagination,
          current: 1,
          pageSize: this.localPagination.pageSize || this.pageSize
        };
      }
      // 重置，清除选择项
      if (bool) {
        this.selectedRowKeys = [];
        this.selectedRows = [];
      }
      this.loadData();
    },

    export() {
      this.$emit('export', {
        pageNo: (this.showPagination && this.localPagination.current) || this.pageNum,
        pageSize: (this.showPagination && this.localPagination.pageSize) || this.pageSize
      });
    },
    paginationChange(page, pageSize) {
      this.loadData({
        current: page,
        pageSize: pageSize
      });
    },
    /**
     * 加载数据方法
     * @param {Object} pagination 分页选项器
     * @param {Object} filters 过滤条件
     * @param {Object} sorter 排序条件
     */
    loadData(pagination, filters, sorter) {
      if (!this.data) return;
      this.localLoading = true;
      const parameter = {
        pageNo:
          (pagination && pagination.current) ||
          (this.showPagination && this.localPagination.current) ||
          this.pageNum,
        pageSize:
          (pagination && pagination.pageSize) ||
          (this.showPagination && this.localPagination.pageSize) ||
          this.pageSize,
        ...((sorter && sorter.field && { sortField: sorter.field }) || {}),
        ...((sorter && sorter.order && { sortOrder: sorter.order }) || {}),
        ...filters
      };
      const result = this.data(parameter);
      // 对接自己的通用数据接口需要修改下方代码中的 r.pageNo, r.totalCount, r.data
      // eslint-disable-next-line
      if (
        (typeof result === 'object' || typeof result === 'function') &&
        typeof result.then === 'function'
      ) {
        result
          .then(r => {
            // if (!r) {
            //   this.localLoading = false;
            //   return;
            // }
            let current = baseGet(r, this.dataKeys.current);
            let total = baseGet(r, this.dataKeys.total);
            let records = baseGet(r, this.dataKeys.records) || [];
            let showPagination = this.showPagination;

            if (showPagination) {
              this.localPagination = {
                ...this.localPagination,
                current: current, // 返回结果中的当前分页数
                total: total, // 返回结果中的总记录数
                showSizeChanger: this.showSizeChanger,
                pageSize: (pagination && pagination.pageSize) || this.localPagination.pageSize
              };
            }

            // 为防止删除数据后导致页面当前页面数据长度为 0 ,自动翻页到上一页
            if (
              records.length === 0 &&
              this.showPagination &&
              this.localPagination.current &&
              this.localPagination.current > 1
            ) {
              this.localPagination.current--;
              this.loadData();
              return;
            }
            // 返回数据格式不正确时关闭分页
            if (!total && !current) {
              this.localPagination = false;
            }

            this.localDataSource = records.map((o, index) => {
              return {
                ...o,
                index: this.localPagination
                  ? (this.localPagination.current - 1) * this.localPagination.pageSize + index + 1
                  : index + 1
              };
            }); // 返回结果中的数组数据
            this.updateDataSource();
            this.localLoading = false;
          })
          .catch(() => {
            this.localLoading = false;
          });
      } else {
        this.localLoading = false;
      }
    },

    initTotalList(columns) {
      const totalList = [];
      columns &&
        columns instanceof Array &&
        columns.forEach(column => {
          if (column.needTotal) {
            totalList.push({
              ...column,
              total: 0
            });
          }
        });
      return totalList;
    },

    redoHeight() {
      if (!this.canResize) {
        return;
      }
      this.calcTableHeight();
    },

    calcTableHeight(cb) {
      const { canResize, resizeHeightOffset, pagination, maxHeight, scroll } = this;

      if (!canResize) {
        return;
      }

      this.$nextTick(() => {
        const table = this.$refs.table;
        const elem = this.$el;

        if (!table) {
          return;
        }
        const tableEl = table.$el;
        if (!tableEl) {
          return;
        }

        const el = tableEl.querySelector('.wpg-table-thead');
        // const tbody = tableEl.querySelector('.wpg-table-body');
        if (!el) {
          return;
        }
        // 表格距离底部高度
        // const { height: bottomIncludeBody } = getBoundingClientRect(elem);
        const bottomIncludeBody = elem.offsetHeight;

        // 表格高度+距离底部高度-自定义偏移量
        // const paddingHeight = 12;
        const paddingHeight = 0;
        const borderHeight = 1 * 2;
        // 分页器高度

        // TODO 先固定 52
        let paginationHeight = 0;
        if (!isBoolean(pagination)) {
          paginationHeight = 52;
        }

        let footerHeight = 0;
        if (!isBoolean(pagination)) {
          const footerEl = tableEl.querySelector('.wpg-table-footer');
          if (footerEl) {
            const offsetHeight = footerEl.offsetHeight;
            footerHeight += offsetHeight || 0;
          }
        }

        let titleHeight = 0;
        const titleEl = tableEl.querySelector('.wpg-table-title');
        if (titleEl) {
          titleHeight = titleEl.offsetHeight || 0;
        }

        let headerHeight = 0;
        if (el) {
          headerHeight = el.offsetHeight;
        }

        let tableHeight =
          bottomIncludeBody -
          (resizeHeightOffset || 0) -
          paddingHeight -
          borderHeight -
          paginationHeight -
          footerHeight -
          titleHeight -
          headerHeight;

        if (maxHeight && tableHeight > maxHeight) {
          tableHeight = maxHeight;
        }

        setTimeout(() => {
          this.localScroll = {
            x: false,
            y: tableHeight,
            scrollToFirstRowOnChange: false,
            ...scroll
          };

          cb && cb();
        }, 16);

        this.updateTableHeight(tableHeight);
      });
    },

    updateTableHeight() {},

    /**
     * 用于更新已选中的列表数据 total 统计
     * @param selectedRowKeys
     * @param selectedRows
     */
    updateSelect(selectedRowKeys, selectedRows) {
      this.selectedRows = selectedRows;
      this.selectedRowKeys = selectedRowKeys;
      const list = this.needTotalList;
      this.needTotalList = list.map(item => {
        return {
          ...item,
          total: selectedRows.reduce((sum, val) => {
            const total = sum + parseInt(get(val, item.dataIndex), 10);
            return isNaN(total) ? 0 : total;
          }, 0)
        };
      });
    },

    updateScroll(scroll) {
      this.localScroll = { ...this.localScroll, ...scroll };
    },

    showLoading() {
      this.localLoading = true;
    },

    hideLoading() {
      this.localLoading = false;
    },
    /**
     * 清空 table 已选中项
     */
    clearSelected() {
      if (this.rowSelection) {
        this.rowSelection.onChange([], []);
        this.updateSelect([], []);
      }
    },
    /**
     * 处理交给 table 使用者去处理 clear 事件时，内部选中统计同时调用
     * @param callback
     * @returns {*}
     */
    renderClear(callback) {
      if (this.selectedRowKeys.length <= 0) return null;
      return (
        <a
          style="margin-left: 24px"
          onClick={() => {
            callback();
            this.clearSelected();
          }}
        >
          清空
        </a>
      );
    },
    renderAlert() {
      // 绘制统计列数据
      const needTotalItems = this.needTotalList.map(item => {
        return (
          <span style="margin-right: 12px">
            {item.title}总计{' '}
            <a style="font-weight: 600">
              {!item.customRender ? item.total : item.customRender(item.total)}
            </a>
          </span>
        );
      });

      // 绘制 清空 按钮
      const clearItem =
        typeof this.alert.clear === 'boolean' && this.alert.clear
          ? this.renderClear(this.clearSelected)
          : this.alert !== null && typeof this.alert.clear === 'function'
          ? this.renderClear(this.alert.clear)
          : null;

      // 绘制 alert 组件
      return (
        <div class="supply-pro-table-alert supply-text-third">
          <span style="margin-right: 12px">
            已选择: <a style="font-weight: 600">{this.selectedRows.length}</a> 条
          </span>
          {needTotalItems}
          {clearItem}
        </div>
      );
    },
    /**
     * 渲染列修改
     */
    onColumnsChange(checkedList) {
      this.localColumns = this.columns.filter(({ key, dataIndex }, index) => {
        let columnKey = genColumnKey(key, dataIndex, index);

        return checkedList.includes(columnKey);
      });
    },

    updateDataSource() {
      if (this.filterTableRow && typeof this.filterTableRow === 'function') {
        this.localDataSource = this.localDataSource.filter(this.filterTableRow);
      }
    },
    /**
     * 绘制表格处理
     */
    renderOption() {
      let { options } = this;
      if (options === true) {
        options = {
          reload: true,
          setting: true,
          export: true
        };
      }

      const reloadItem = (
        <span class="supply-pro-table-toolbar-item">
          <w-icon
            type="reload"
            onClick={() => {
              this.refresh();
            }}
          />
        </span>
      );

      const exportItem = (
        <span class="supply-pro-table-toolbar-item">
          <w-button onClick={this.export}>Excel导出</w-button>
        </span>
      );

      return (
        <div class="supply-pro-table-option">
          {options.reload ? reloadItem : null}
          {options.setting ? (
            <ColumnSetting
              ref="setting"
              columns={this.columns}
              localColumnKey={this.localColumnKey}
              onChange={this.onColumnsChange}
            />
          ) : null}
          {options.export ? exportItem : null}
        </div>
      );
    },

    renderTitle() {
      const { title, options, titleHelpMessage, selectedRows } = this;
      let tableTitle = this.$slots.tableTitle || null;
      let toolbar = this.$slots.tableToolbar || null;
      const showAlert =
        (typeof alert === 'object' &&
          alert.show &&
          typeof this.rowSelection.selectedRowKeys !== 'undefined') ||
        this.alert;

      return () => {
        return (
          <TableTitle helpMessage={titleHelpMessage} title={title} selectedRows={selectedRows}>
            {tableTitle}
            {showAlert ? this.renderAlert() : null}
            <template slot="toolbar">
              {toolbar}
              {options ? this.renderOption() : null}
            </template>
          </TableTitle>
        );
      };
    }
  },

  render() {
    const props = {};
    const localKeys = Object.keys(this.$data);
    const { title, alert, options } = this;
    const { tableTitle, tableToolbar } = this.$slots;

    const showAlert =
      (typeof alert === 'object' &&
        alert !== null &&
        alert.show &&
        typeof this.rowSelection.selectedRowKeys !== 'undefined') ||
      this.alert;

    const titleData =
      !tableTitle && !isString(title) && !title && !tableToolbar && !options && !showAlert
        ? {}
        : {
            title:
              !tableTitle && !title && !tableToolbar && !options && !showAlert
                ? null
                : this.renderTitle()
          };

    Object.keys(T.props).forEach(k => {
      const localKey = `local${k.substring(0, 1).toUpperCase()}${k.substring(1)}`;
      if (localKeys.includes(localKey)) {
        props[k] = this[localKey];
        return props[k];
      }
      if (k === 'rowSelection') {
        if (showAlert && this.rowSelection) {
          // 如果需要使用alert，则重新绑定 rowSelection 事件
          props[k] = {
            ...this.rowSelection,
            selectedRows: this.selectedRows,
            selectedRowKeys: this.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
              this.updateSelect(selectedRowKeys, selectedRows);
              typeof this[k].onChange !== 'undefined' &&
                this[k].onChange(selectedRowKeys, selectedRows);
            }
          };
          return props[k];
        } else if (!this.rowSelection) {
          // 如果没打算开启 rowSelection 则清空默认的选择项
          props[k] = null;
          return props[k];
        }
      }
      this[k] && (props[k] = this[k]);
      return props[k];
    });
    // delete props.scroll
    props.pagination = false;

    const table = (
      <AutoSizeTable
        ref="table"
        attrs={props}
        scopedSlots={this.$scopedSlots}
        onChange={this.loadData}
        onExpand={(expanded, record) => {
          this.$emit('expand', expanded, record);
        }}
      >
        {Object.keys(this.$slots).map(name => (
          <template slot={name}>{this.$slots[name]}</template>
        ))}
      </AutoSizeTable>
    );

    const tableClassNames = {
      'supply-pro-table-wrapper': true,
      'supply-pro-table-resize': this.getCanResize,
      'supply-flex': true,
      'supply-flex-col': true
    };
    return (
      <w-config-provider
        {...{ scopedSlots: { renderEmpty: slotProps => [<w-empty slotprops={slotProps} />] } }}
      >
        <div class={tableClassNames}>
          <div class="supply-pl-5 supply-pr-8">{titleData?.title?.() ?? titleData?.title}</div>
          <div class="supply-flex-1 supply-overflow-hidden">{table}</div>
          <div class="supply-flex">
            <w-pagination
              class="supply-ml-auto supply-mr-4 supply-py-2"
              attrs={{ ...this.localPagination }}
              onShowSizeChange={this.paginationChange}
              onChange={this.paginationChange}
            ></w-pagination>
          </div>
        </div>
      </w-config-provider>
    );
  }
};
