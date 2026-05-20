module.exports = (api) => {
  // api.env() sets up environment-based cache invalidation automatically;
  // calling api.cache(true) alongside it would conflict.
  const isTest = api.env("test");
  return {
    presets: [
      [
        // babel-preset-expo is nested inside expo/node_modules, not at the root;
        // use the internal re-export path that IS resolvable from here.
        require.resolve("expo/internal/babel-preset"),
        // Disable Reanimated Babel plugin in test env — react-native-worklets/plugin
        // is not installed, so leaving it enabled crashes Jest's transform step.
        isTest ? { reanimated: false } : {},
      ],
    ],
  };
};
