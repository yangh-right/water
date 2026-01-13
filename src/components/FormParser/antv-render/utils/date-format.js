import moment from 'moment';

function formatDate(value, format) {
  return value ? moment(value).format(format) : '';
}

export default function dateFormat(value, format, separator) {
  format = format.replace('yyyy', 'YYYY').replace('dd', 'DD');

  if (Array.isArray(value)) {
    return `${formatDate(value[0], format)}${separator}${formatDate(value[1], format)}`;
  }

  return formatDate(value, format);
}
