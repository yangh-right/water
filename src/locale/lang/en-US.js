import { genMessage } from '../helper';

const files = require.context('./en-US', true, /\.js$/);

export default {
  message: {
    ...genMessage(files, 'es-US')
  },
  dateLocale: null,
  dateLocaleName: 'en'
};
