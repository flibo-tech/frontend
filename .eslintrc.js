// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: "babel-eslint",
  },
  env: {
    browser: true,
  },
  // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
  // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
  extends: ["plugin:vue/essential", "airbnb-base"],
  // required to lint *.vue files
  plugins: ["vue"],
  // check if imports actually resolve
  settings: {
    "import/resolver": {
      webpack: {
        config: "build/webpack.base.conf.js",
      },
    },
  },
  // add your custom rules here
  rules: {
    "linebreak-style": 0,
    // don't require .vue extension when importing
    "import/extensions": [
      "error",
      "always",
      {
        js: "never",
        vue: "never",
      },
    ],
    quotes: "off",
    "comma-dangle": [2, "never"],
    indent: 0,
    "space-infix-ops": 0,
    "space-before-function-paren": 0,
    "no-extra-semi": 0,
    semi: 0,
    "object-shorthand": 0,
    "prefer-template": 0,
    eqeqeq: 0,
    camelcase: 0,
    "eol-last": 0,
    "space-before-blocks": 0,
    "no-unused-vars": 0,
    // "indent": [2, "tab"],
    "no-tabs": 0,
    // disallow reassignment of function parameters
    // disallow parameter object manipulation except for specific exclusions
    "no-param-reassign": [
      "error",
      {
        props: true,
        ignorePropertyModificationsFor: [
          "state", // for vuex state
          "acc", // for reduce accumulators
          "e", // for e.returnvalue
        ],
      },
    ],
    // allow optionalDependencies
    "import/no-extraneous-dependencies": [
      "error",
      {
        optionalDependencies: ["test/unit/index.js"],
      },
    ],
    // allow debugger during development
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
  },
};
