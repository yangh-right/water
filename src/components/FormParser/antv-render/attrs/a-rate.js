export default function attr(attrs, key, value) {
  switch (key) {
    case "max":
      attrs["count"] = value;
      break;
    default:
      attrs[key] = value;
      break;
  }
}
