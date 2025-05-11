const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    plugins: {},
    rules: {},
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: "commonjs",
      globals: {
        ...require("globals").node
      }
    }
  }
];
