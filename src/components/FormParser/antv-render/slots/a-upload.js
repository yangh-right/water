export default {
  "list-type": (h, conf, key) => {
    const list = [];
    const config = conf.__config__;
    if (conf["list-type"] === "picture-card") {
      list.push(<w-icon type="plus" />);
    } else {
      list.push(
        <w-button>
          {" "}
          <w-icon type="upload" /> {config.buttonText}{" "}
        </w-button>
      );
    }
    if (config.showTip) {
      list.push(
        <div class="ant-upload__tip">
          只能上传不超过 {config.fileSize}
          {config.sizeUnit} 的{conf.accept}文件
        </div>
      );
    }
    return list;
  }
};
