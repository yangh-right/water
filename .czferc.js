const yaml = require("js-yaml");
const path = require("path");
const fs = require("fs");
const inquirer = require('inquirer')
inquirer.registerPrompt("autocomplete", require("inquirer-autocomplete-prompt"));

// https://github.com/carloscuesta/gitmoji/blob/master/src/data/gitmojis.json
const typeList = [
  {
    name: "✨: 新特性",
    value: ":sparkles: feature",
  },
  {
    name: "🐛: bug修复",
    value: ":bug: fix",
  },
  {
    name: "📝: 文档变更",
    value: ":memo: docs",
  },
  {
    name: "💄: 更新样式",
    value: ":lipstick: style",
  },
  {
    name: "♻️: 代码重构",
    value: ":recycle: refactor",
  },
  {
    name: "⚡️: 性能优化",
    value: ":zap: perf",
  },
  {
    name: "✅: 单元测试",
    value: ":white-check-mark: test",
  },
  {
    name: "🏗️: 更新构建系统",
    value: ":building-construction: build",
  },
  {
    name: "👷: 自动化构建",
    value: ":construction-worker: ci",
  },
  {
    name: "🔧: 别的修改不影响测试及源代码",
    value: ":wrench: chore",
  },
  {
    name: "⏪️: Reverts commit",
    value: ":rewind: revert",
  },
];

const gitmojis = [
  {
    emoji: "🐛",
    entity: "&#x1f41b;",
    code: ":bug:",
    description: "Fix a bug.",
    name: "bug",
    semver: "patch",
  },
  {
    emoji: "✨",
    entity: "&#x2728;",
    code: ":sparkles:",
    description: "Introduce new features.",
    name: "sparkles",
    semver: "minor",
  },
  {
    emoji: "🎨",
    entity: "&#x1f3a8;",
    code: ":art:",
    description: "Improve structure / format of the code.",
    name: "art",
    semver: null,
  },
  {
    emoji: "⚡️",
    entity: "&#x26a1;",
    code: ":zap:",
    description: "Improve performance.",
    name: "zap",
    semver: "patch",
  },
  {
    emoji: "🔥",
    entity: "&#x1f525;",
    code: ":fire:",
    description: "Remove code or files.",
    name: "fire",
    semver: null,
  },
  {
    emoji: "🚑️",
    entity: "&#128657;",
    code: ":ambulance:",
    description: "Critical hotfix.",
    name: "ambulance",
    semver: "patch",
  },
  {
    emoji: "📝",
    entity: "&#x1f4dd;",
    code: ":memo:",
    description: "Add or update documentation.",
    name: "memo",
    semver: null,
  },
  {
    emoji: "💄",
    entity: "&#ff99cc;",
    code: ":lipstick:",
    description: "Add or update the UI and style files.",
    name: "lipstick",
    semver: "patch",
  },
  {
    emoji: "♻️",
    entity: "&#x2672;",
    code: ":recycle:",
    description: "Refactor code.",
    name: "recycle",
    semver: null,
  },

  {
    emoji: "🚚",
    entity: "&#1F69A;",
    code: ":truck:",
    description: "Move or rename resources (e.g.: files, paths, routes).",
    name: "truck",
    semver: null,
  },

  {
    emoji: "✏️",
    entity: "&#59161;",
    code: ":pencil2:",
    description: "Fix typos.",
    name: "pencil2",
    semver: "patch",
  },
  {
    emoji: "🚧",
    entity: "&#x1f6a7;",
    code: ":construction:",
    description: "Work in progress.",
    name: "construction",
    semver: null,
  },
  {
    emoji: "⬆️",
    entity: "⬆️",
    code: ":arrow_up:",
    description: "Upgrade dependencies.",
    name: "arrow-up",
    semver: "patch",
  },
  {
    emoji: "⬇️",
    entity: "⬇️",
    code: ":arrow_down:",
    description: "Downgrade dependencies.",
    name: "arrow-down",
    semver: "patch",
  },
  {
    emoji: "🎉",
    entity: "&#127881;",
    code: ":tada:",
    description: "Begin a project.",
    name: "tada",
    semver: null,
  },

  {
    emoji: "🚀",
    entity: "&#x1f680;",
    code: ":rocket:",
    description: "Deploy stuff.",
    name: "rocket",
    semver: null,
  },
  {
    emoji: "✅",
    entity: "&#x2705;",
    code: ":white_check_mark:",
    description: "Add, update, or pass tests.",
    name: "white-check-mark",
    semver: null,
  },
  {
    emoji: "🔒️",
    entity: "&#x1f512;",
    code: ":lock:",
    description: "Fix security issues.",
    name: "lock",
    semver: "patch",
  },
  {
    emoji: "🔖",
    entity: "&#x1f516;",
    code: ":bookmark:",
    description: "Release / Version tags.",
    name: "bookmark",
    semver: null,
  },
  {
    emoji: "🚨",
    entity: "&#x1f6a8;",
    code: ":rotating_light:",
    description: "Fix compiler / linter warnings.",
    name: "rotating-light",
    semver: null,
  },

  {
    emoji: "💚",
    entity: "&#x1f49a;",
    code: ":green_heart:",
    description: "Fix CI Build.",
    name: "green-heart",
    semver: null,
  },
  {
    emoji: "📌",
    entity: "&#x1F4CC;",
    code: ":pushpin:",
    description: "Pin dependencies to specific versions.",
    name: "pushpin",
    semver: "patch",
  },
  {
    emoji: "👷",
    entity: "&#x1f477;",
    code: ":construction_worker:",
    description: "Add or update CI build system.",
    name: "construction-worker",
    semver: null,
  },
  {
    emoji: "📈",
    entity: "&#x1F4C8;",
    code: ":chart_with_upwards_trend:",
    description: "Add or update analytics or track code.",
    name: "chart-with-upwards-trend",
    semver: "patch",
  },
  {
    emoji: "➕",
    entity: "&#10133;",
    code: ":heavy_plus_sign:",
    description: "Add a dependency.",
    name: "heavy-plus-sign",
    semver: "patch",
  },
  {
    emoji: "➖",
    entity: "&#10134;",
    code: ":heavy_minus_sign:",
    description: "Remove a dependency.",
    name: "heavy-minus-sign",
    semver: "patch",
  },
  {
    emoji: "🔧",
    entity: "&#x1f527;",
    code: ":wrench:",
    description: "Add or update configuration files.",
    name: "wrench",
    semver: "patch",
  },
  {
    emoji: "🔨",
    entity: "&#128296;",
    code: ":hammer:",
    description: "Add or update development scripts.",
    name: "hammer",
    semver: null,
  },
  {
    emoji: "🌐",
    entity: "&#127760;",
    code: ":globe_with_meridians:",
    description: "Internationalization and localization.",
    name: "globe-with-meridians",
    semver: "patch",
  },
  {
    emoji: "💩",
    entity: "&#58613;",
    code: ":poop:",
    description: "Write bad code that needs to be improved.",
    name: "poop",
    semver: null,
  },
  {
    emoji: "⏪️",
    entity: "&#9194;",
    code: ":rewind:",
    description: "Revert changes.",
    name: "rewind",
    semver: "patch",
  },
  {
    emoji: "🔀",
    entity: "&#128256;",
    code: ":twisted_rightwards_arrows:",
    description: "Merge branches.",
    name: "twisted-rightwards-arrows",
    semver: null,
  },
  {
    emoji: "📦️",
    entity: "&#1F4E6;",
    code: ":package:",
    description: "Add or update compiled files or packages.",
    name: "package",
    semver: "patch",
  },
  {
    emoji: "👽️",
    entity: "&#1F47D;",
    code: ":alien:",
    description: "Update code due to external API changes.",
    name: "alien",
    semver: "patch",
  },
  {
    emoji: "📄",
    entity: "&#1F4C4;",
    code: ":page_facing_up:",
    description: "Add or update license.",
    name: "page-facing-up",
    semver: null,
  },
  {
    emoji: "💥",
    entity: "&#x1f4a5;",
    code: ":boom:",
    description: "Introduce breaking changes.",
    name: "boom",
    semver: "major",
  },
  {
    emoji: "🍱",
    entity: "&#1F371",
    code: ":bento:",
    description: "Add or update assets.",
    name: "bento",
    semver: "patch",
  },
  {
    emoji: "♿️",
    entity: "&#9855;",
    code: ":wheelchair:",
    description: "Improve accessibility.",
    name: "wheelchair",
    semver: "patch",
  },
  {
    emoji: "💡",
    entity: "&#128161;",
    code: ":bulb:",
    description: "Add or update comments in source code.",
    name: "bulb",
    semver: null,
  },
  {
    emoji: "🍻",
    entity: "&#x1f37b;",
    code: ":beers:",
    description: "Write code drunkenly.",
    name: "beers",
    semver: null,
  },
  {
    emoji: "💬",
    entity: "&#128172;",
    code: ":speech_balloon:",
    description: "Add or update text and literals.",
    name: "speech-balloon",
    semver: "patch",
  },
  {
    emoji: "🗃️",
    entity: "&#128451;",
    code: ":card_file_box:",
    description: "Perform database related changes.",
    name: "card-file-box",
    semver: "patch",
  },
  {
    emoji: "🔊",
    entity: "&#128266;",
    code: ":loud_sound:",
    description: "Add or update logs.",
    name: "loud-sound",
    semver: null,
  },
  {
    emoji: "🔇",
    entity: "&#128263;",
    code: ":mute:",
    description: "Remove logs.",
    name: "mute",
    semver: null,
  },
  {
    emoji: "👥",
    entity: "&#128101;",
    code: ":busts_in_silhouette:",
    description: "Add or update contributor(s).",
    name: "busts-in-silhouette",
    semver: null,
  },
  {
    emoji: "🚸",
    entity: "&#128696;",
    code: ":children_crossing:",
    description: "Improve user experience / usability.",
    name: "children-crossing",
    semver: "patch",
  },
  {
    emoji: "🏗️",
    entity: "&#1f3d7;",
    code: ":building_construction:",
    description: "Make architectural changes.",
    name: "building-construction",
    semver: null,
  },
  {
    emoji: "📱",
    entity: "&#128241;",
    code: ":iphone:",
    description: "Work on responsive design.",
    name: "iphone",
    semver: "patch",
  },
  {
    emoji: "🤡",
    entity: "&#129313;",
    code: ":clown_face:",
    description: "Mock things.",
    name: "clown-face",
    semver: null,
  },
  {
    emoji: "🥚",
    entity: "&#129370;",
    code: ":egg:",
    description: "Add or update an easter egg.",
    name: "egg",
    semver: "patch",
  },
  {
    emoji: "🙈",
    entity: "&#8bdfe7;",
    code: ":see_no_evil:",
    description: "Add or update a .gitignore file.",
    name: "see-no-evil",
    semver: null,
  },
  {
    emoji: "📸",
    entity: "&#128248;",
    code: ":camera_flash:",
    description: "Add or update snapshots.",
    name: "camera-flash",
    semver: null,
  },
  {
    emoji: "⚗️",
    entity: "&#128248;",
    code: ":alembic:",
    description: "Perform experiments.",
    name: "alembic",
    semver: "patch",
  },
  {
    emoji: "🔍️",
    entity: "&#128269;",
    code: ":mag:",
    description: "Improve SEO.",
    name: "mag",
    semver: "patch",
  },
  {
    emoji: "🏷️",
    entity: "&#127991;",
    code: ":label:",
    description: "Add or update types.",
    name: "label",
    semver: "patch",
  },
  {
    emoji: "🌱",
    entity: "&#127793;",
    code: ":seedling:",
    description: "Add or update seed files.",
    name: "seedling",
    semver: null,
  },
  {
    emoji: "🚩",
    entity: "&#x1F6A9;",
    code: ":triangular_flag_on_post:",
    description: "Add, update, or remove feature flags.",
    name: "triangular-flag-on-post",
    semver: "patch",
  },
  {
    emoji: "🥅",
    entity: "&#x1F945;",
    code: ":goal_net:",
    description: "Catch errors.",
    name: "goal-net",
    semver: "patch",
  },
  {
    emoji: "💫",
    entity: "&#x1f4ab;",
    code: ":dizzy:",
    description: "Add or update animations and transitions.",
    name: "animation",
    semver: "patch",
  },
  {
    emoji: "🗑️",
    entity: "&#x1F5D1;",
    code: ":wastebasket:",
    description: "Deprecate code that needs to be cleaned up.",
    name: "wastebasket",
    semver: "patch",
  },
  {
    emoji: "🛂",
    entity: "&#x1F6C2;",
    code: ":passport_control:",
    description: "Work on code related to authorization, roles and permissions.",
    name: "passport-control",
    semver: "patch",
  },
  {
    emoji: "🩹",
    entity: "&#x1FA79;",
    code: ":adhesive_bandage:",
    description: "Simple fix for a non-critical issue.",
    name: "adhesive-bandage",
    semver: "patch",
  },
  {
    emoji: "🧐",
    entity: "&#x1F9D0;",
    code: ":monocle_face:",
    description: "Data exploration/inspection.",
    name: "monocle-face",
    semver: null,
  },
  {
    emoji: "⚰️",
    entity: "&#x26B0;",
    code: ":coffin:",
    description: "Remove dead code.",
    name: "coffin",
    semver: null,
  },
  {
    emoji: "🧪",
    entity: "&#x1F9EA;",
    code: ":test_tube:",
    description: "Add a failing test.",
    name: "test-tube",
    semver: null,
  },
  {
    emoji: "👔",
    entity: "&#128084;",
    code: ":necktie:",
    description: "Add or update business logic",
    name: "necktie",
    semver: "patch",
  },
];

const storePath = path.resolve(__dirname, "./.czstore");

const isExist = fs.existsSync(storePath);
if (!isExist) {
  fs.openSync(storePath, "w");
}

const store = yaml.load(fs.readFileSync(storePath)) || {
  versions: [],
  jiras: [],
};

// 处理老的数据和异常数据
if (store.version) {
  store.versions = store.version;
}
if (!store.versions) {
  store.versions = [];
}
if (store.jira) {
  store.jiras = store.jira;
}
if (!store.jiras) {
  store.jiras = [];
}

let mojiDescription

module.exports = {
  async questions({ _inquirer, gitInfo }) {
    const result = await inquirer.prompt([{
      type: 'autocomplete',
      name: 'type',
      message: '选择类型',
      source: function(answersSoFar, input) {
        return gitmojis.filter(moji => {
          if (moji.description.toLowerCase().includes((input || '').toLowerCase())) {
            return true
          }
        }).map(moji => `${moji.emoji} ${moji.description}`)
      }
    }])

    mojiDescription = result.type

    return [
      // {
      //   type: "list",
      //   name: "type",
      //   message: "选择类型",
      //   choices: typeList,
      // },
      {
        type: "list",
        name: "version",
        message: "选择发行版本",
        choices: ["待输入"].concat(store.versions).concat(["无"]),
      },
      {
        type: "input",
        name: "newVersion",
        message: "请输入新的版本",
        when: (answers) => answers.version === "待输入",
        validate: (message) => (message ? true : false),
      },
      {
        type: "list",
        name: "jira",
        message: "选择jira号",
        choices: ["待输入"].concat(store.jiras).concat(["无"]),
      },
      {
        type: "input",
        name: "newJira",
        message: "请输入新的jira号",
        when: (answers) => answers.jira === "待输入",
        validate: (message) => (message ? true : false),
      },
      {
        type: "input",
        name: "message",
        message: "请输入commit信息",
        validate: (message) => (message ? true : false),
      },
    ];
  },
  commitMessage({ answers, gitInfo }) {
    process.on("unhandledRejection", (reason) => {
      console.error(reason);
      process.exit(1);
    });

    const version = answers.version !== "无" ? answers.newVersion || answers.version : "";
    const jira = answers.jira !== "无" ? answers.newJira || answers.jira : "";

    if (version) {
      const index = store.versions.findIndex((v) => version == v);
      if (index > -1) {
        store.versions = [...store.versions.slice(0, index), ...store.versions.slice(index + 1)];
      }
      store.versions.unshift(version);
      store.versions = store.versions.slice(0, 10);
    }
    if (jira) {
      const index = store.jiras.findIndex((v) => jira == v);
      if (index > -1) {
        store.jiras = [...store.jiras.slice(0, index), ...store.jiras.slice(index + 1)];
      }
      store.jiras.unshift(jira);
      store.jiras = store.jiras.slice(0, 10);
    }

    fs.writeFileSync(
      storePath,
      yaml.dump({
        versions: store.versions,
        jiras: store.jiras,
      })
    );



    const moji = gitmojis.find(moji => {
      if (mojiDescription.includes(moji.emoji)) {
        return true
      }
    })
    return `${jira ? `${jira} ` : ""}${version ? `${version} ` : ""}${moji.code} ${answers.message}`;
  },
};
