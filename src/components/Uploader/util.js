/*
 * @Author: wangyr
 * @Date: 2024-05-08 11:40:24
 * @LastEditors: wangyr
 * @LastEditTime: 2024-05-08 11:47:40
 * @Description:
 */
import serverConfig from '@/config/server.config';

export function uidGenerator() {
  return '-' + parseInt(Math.random() * 10000 + 1, 10);
}

export function getFileName(path) {
  let p = path;
  if (p.lastIndexOf('\\') >= 0) {
    let reg = /\\\\/g;
    p = p.replace(reg, '/');
  }
  return p.substring(p.lastIndexOf('/') + 1);
}

export function getFileAccessHttpUrl(avatar, previewBaseUrl, subStr = serverConfig.API_BASE_URL) {
  if (avatar?.startsWith(subStr) || avatar?.startsWith('http')) {
    return avatar;
  } else {
    return previewBaseUrl + avatar;
  }
}
