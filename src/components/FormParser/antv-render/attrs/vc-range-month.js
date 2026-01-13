import date from "./date";

export default function attr(attrs, key, value) {
  switch (key) {
    case "range-separator":
      attrs["separator"] = value;
      break;
    case "start-placeholder":
      attrs["placeholder"] = attrs["placeholder"] || [];
      attrs["placeholder"][0] = value;
      break;
    case "end-placeholder":
      attrs["placeholder"] = attrs["placeholder"] || [];
      attrs["placeholder"][1] = value;
      break;
    default:
      date(attrs, key, value);
      break;
  }
}
