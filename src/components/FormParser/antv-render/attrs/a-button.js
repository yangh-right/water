const sizeMappers = {
  medium: "default",
  small: "large",
  mini: "small"
};

export default function attr(attrs, key, value) {
  switch (key) {
    case "size":
      attrs["size"] = sizeMappers[value];
      break;
    default:
      attrs[key] = value;
      break;
  }
}
