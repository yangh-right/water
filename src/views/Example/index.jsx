import { defineComponent } from "@vue/composition-api";
import Select from "./Select.vue";
import Table from "./Table.vue";
import Chart from "./Chart.vue";
import Icons from "./Icons.vue";
import Demos from "./Demos.vue";

export default defineComponent({
  setup() {
    return {};
  },
  render() {
    return <div>
      <w-tabs default-active-key="4">
        <w-tab-pane key="1" tab="demos">
          <Demos></Demos>
        </w-tab-pane>
        <w-tab-pane key="2" tab="pagination table">
          <div style="height: 500px;">
            <Table class="supply-h-full"></Table>
          </div>
        </w-tab-pane>
        <w-tab-pane key="3" tab="区域组织选择器">
          <Select></Select>
        </w-tab-pane>
        <w-tab-pane key="4" tab="echarts">
          <Chart></Chart>
        </w-tab-pane>
        <w-tab-pane key="5" tab="icons">
          <Icons></Icons>
        </w-tab-pane>
      </w-tabs>

    </div>;
  }
});
