import { genMessage } from '../helper';

const files = require.context('./zh-CN', true, /\.js$/);

export default {
  message: {
    ...genMessage(files, 'zh-CN')
  }
};
