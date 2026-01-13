/*
 * @Author: wangyr
 * @Date: 2024-05-09 11:10:47
 * @LastEditors: wangyr
 * @LastEditTime: 2024-05-09 11:25:25
 * @Description:
 */
import { sysDictListByCode } from '@/api/manage';

export default {
  data() {
    return {
      lineList: [],
      lineDict: {}
    };
  },
  computed: {},
  created() {
    this.getLineDict();
  },
  methods: {
    /* 数据字典 - 南北线 */
    getLineDict() {
      sysDictListByCode('purification_line').then(res => {
        if (res.status === 'complete') {
          this.lineList = res.resultData;
          this.lineDict = this.dealDict(res.resultData, 'dictValue');
        }
      });
    },
    /* 处理数据字典数据 */
    dealDict(_data, type) {
      let obj = {};
      _data.forEach(r => {
        obj[r[type]] = r.dictName;
      });
      return obj;
    }
  }
};
