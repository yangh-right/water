/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2022-09-05 08:39:36
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2022-09-28 19:33:32
 * @Description:
 */
import moment from 'moment';
export function exportFile(
  data,
  filename,
  ext = 'xls',
  mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
) {
  let time = moment().format('YYYYMMDD');
  // if (data instanceof Blob) {
  let blob = new Blob([data], { type: mime });
  if (window.navigator.msSaveBlob) {
    try {
      // ie浏览器自带下载文件的方法
      window.navigator.msSaveBlob(data, filename);
    } catch (e) {}
  } else {
    let elink = document.createElement('a');
    elink.download = filename + time + '.' + ext;
    elink.style.display = 'none';
    let href = (window.URL || window.webkitURL).createObjectURL(blob);
    elink.href = href;
    document.body.appendChild(elink);
    elink.click();

    setTimeout(() => {
      document.body.removeChild(elink);
      window.URL.revokeObjectURL(href); // 释放掉blob对象
    }, 200);
  }
  // }
}
