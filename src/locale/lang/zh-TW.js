import { genMessage } from '../helper';

const files = require.context('./zh-TW', true, /\.js$/);

export default {
  message: {
    ...genMessage(files, 'zh-TW')
  }
};
