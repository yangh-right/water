export default function attr(attrs, key, value) {
  switch (key) {
    case "autosize":
      attrs["autoSize"] = value;
      break;
    case "readonly":
      attrs["readOnly"] = value;
      break;
    case "maxlength":
      attrs["maxLength"] = value;
      break;
    default:
      attrs[key] = value;
      break;
  }
}
