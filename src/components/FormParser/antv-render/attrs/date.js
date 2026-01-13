export default function attr(attrs, key, value) {
  const modes = ["time", "date", "month", "year"];

  switch (key) {
    case "clearable":
      attrs["allowClear"] = value;
      break;
    case "type":
      if (value === "datetime") {
        attrs["show-time"] = true;
      } else {
        attrs["mode"] = modes.includes(value) ? value : "date";
      }
      break;
    case "format":
      attrs["format"] = value.replace("yyyy", "YYYY").replace("dd", "DD");
      break;
    case "value-format":
      attrs["value-format"] = value.replace("yyyy", "YYYY").replace("dd", "DD");
      break;
    case "readonly":
      attrs["inputReadOnly"] = value;
      break;
    default:
      attrs[key] = value;
      break;
  }
}
