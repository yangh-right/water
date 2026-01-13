const colors = require("tailwindcss/colors");

module.exports = {
  prefix: "supply-",
  mode: process.env.NODE_ENV === 'development' ? '' : 'jit',
  purge: [
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      spacing: {
      },
      colors: {
        primary: {
          DEFAULT: "var(--supply-color-primary-DEFAULT)",
          active: "var(--supply-color-primary-active)",
          hover: "var(--supply-color-primary-hover)",
        },
        frequency: {
          DEFAULT: "var(--supply-color-frequency-DEFAULT)",
          active: "var(--supply-color-frequency-active)",
          hover: "var(--supply-color-frequency-hover)",
        },
        success: {
          DEFAULT: "var(--supply-color-success-DEFAULT)",
          active: "var(--supply-color-success-active)",
          hover: "var(--supply-color-success-hover)",
        },
        warning: {
          DEFAULT: "var(--supply-color-warning-DEFAULT)",
          active: "var(--supply-color-warning-active)",
          hover: "var(--supply-color-warning-hover)",
        },
        danger: {
          DEFAULT: "var(--supply-color-danger-DEFAULT)",
          active: "var(--supply-color-danger-active)",
          hover: "var(--supply-color-danger-hover)",
        },

        border: {
          DEFAULT: "var(--supply-color-border-DEFAULT)",
          split: "var(--supply-color-border-split)"
        },

        bg: {
          DEFAULT: "var(--supply-color-bg-DEFAULT)",
          invalid: "var(--supply-color-bg-invalid)",
          'card-DEFAULT': "var(--supply-color-bg-card-DEFAULT)",
          'card-light': "var(--supply-color-bg-card-light)",
          'card-dark': "var(--supply-color-bg-card-dark)",
          'card-component': "var(--supply-color-bg-card-component)",
          "select-DEFAULT": "var(--supply-color-bg-select-DEFAULT)",
          "select-active": "var(--supply-color-bg-select-active)"
        },

        main: "var(--supply-color-main)",
        secondary: "var(--supply-color-secondary)",
        third: "var(--supply-color-third)",
        invalid: "var(--supply-color-invalid)",
        auxiliary: "var(--supply-color-auxiliary)",
        deviate: "var(--supply-color-deviate)",
        invert: "var(--supply-color-bg-card-DEFAULT)",
        title: "var(--supply-color-title)",
        partial: "var(--supply-color-partial)",
        icon: {
          DEFAULT: "var(--supply-color-icon)",
          inner: "var(--supply-color-icon-inner)",
          invalid: "var(--supply-color-icon-invalid)"
        },

        table: {
          interval: "var(--supply-color-table-interval)",
          hover: "var(--supply-color-table-hover)",
          head: "var(--supply-color-bg-tabelHead)"
        }
      },
    },
  },

  darkMode: false, // or 'media' or 'class'
  variants: {
    extend: {},
  },
  plugins: [],
};
