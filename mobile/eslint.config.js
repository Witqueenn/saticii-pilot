const { defineConfig } = require("eslint/config");
const expo = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expo,
  // eslint-plugin-react cannot auto-detect the version in flat config;
  // set it explicitly so version.js doesn't crash.
  {
    settings: {
      react: { version: "19" },
    },
  },
  {
    ignores: ["dist/", ".expo/", "node_modules/"],
  },
]);
