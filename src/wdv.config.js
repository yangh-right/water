import Vue from "vue";
import Wdv, {
  Icon,
  message,
  notification,
  Modal,
  DatePicker,
  TimePicker,
  Input,
  Upload,
  Alert,
  Drawer,
  Table,
} from '@wpg/design-vue';
import WYearPicker from '@/components/WYearPicker';

const closeIcon = h =>
  h(Icon, { props: { type: 'ic_close' }, attrs: { style: 'font-size:16px;' } });
const suffixIcon = h =>
  h(Icon, {
    props: { type: 'ic_date_range' },
    attrs: { style: 'font-size:16px;margin-right:3px;' },
  });
const clockIcon = h =>
  h(Icon, {
    props: { type: 'ic_query_builder' },
    attrs: { style: 'font-size:16px;margin-right:3px;' },
  });

message.config({ closeIcon });

notification.config({ closeIcon });

Modal.config({ closeIcon });

DatePicker.config({ suffixIcon });

TimePicker.config({ suffixIcon: clockIcon });

Input.Search.suffixIcon = 'ic_search';
Input.Password.eyeIcon = 'ic_visibility';
Input.Password.eyeInvisibleIcon = 'ic_visibility_off';

Upload.triggerIcon = 'ic_add';
Upload.Dragger.triggerIcon = 'ic_unarchive';
Upload.List.previewIcon = 'ic_insert_photo';
Upload.List.trashIcon = 'ic_delete';
Upload.List.removeIcon = 'ic_close';
Upload.List.downloadIcon = 'ic_file_download';
Upload.List.fileIcon = 'ic_insert_drive_file';

Alert.closeIcon = 'ic_close';

Drawer.closeIcon = 'ic_close';

Table.config({
  filterIcon: 'ic_screening',
  sortUpIcon: 'ic_keyboard_arrow_up',
  sortDownIcon: 'ic_keyboard_arrow_down',
  expandIcon(h) {
    return ({ prefixCls, expandable, expanded, needIndentSpaced, record, onExpand }) => {
      if (expandable) {
        return h(Icon, {
          style: { fontSize: '16px' },
          props: { type: expanded ? 'ic_expand_less' : 'ic_expand_more' },
          on: { click: event => onExpand(record, event) },
        });
      }
      if (needIndentSpaced) {
        return h('span', {
          class: `${prefixCls}-expand-icon ${prefixCls}-spaced`,
        });
      }
      return null;
    };
  },
});

export default {
  install() {
    Vue.use(Wdv)
    Vue.use(WYearPicker);
  }
};
