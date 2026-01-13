/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2022-03-25 10:14:27
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-02-14 16:29:27
 * @Description: 
 */
module.exports = {
  root: true,
  env: {
    node: true,
  },
  globals: {
    log: true,
    L: false,
  },
  parserOptions: {
    parser: "@typescript-eslint/parser",
  },

  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-unused-vars": 1,
  },

  extends: ["plugin:vue/essential", "eslint:recommended", "@vue/typescript"],
};
