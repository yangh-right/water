import date from "./date";

const modeMappers = {
  timerange: "time",
  daterange: "date",
  monthrange: "month",
  datetimerange: "date"
};

export default function attr(attrs, key, value) {
  switch (key) {
    case "type":
      if (value === "datetimerange") {
        attrs["show-time"] = true;
      } else if (value === "timerange") {
        attrs["mode"] = ["time", "time"];
        attrs["show-time"] = true;
      } else {
        value = modeMappers[value] ? modeMappers[value] : "date";
        attrs["mode"] = [value, value];
      }

      break;
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
