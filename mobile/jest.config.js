/** @type {import('jest-expo').JestExpoConfig} */
module.exports = {
  preset: "jest-expo",
  // React Native ve Expo paketleri CommonJS değil ESM yayınlıyor;
  // Jest'in bunları transform etmesi için node_modules istisnası gerekli.
  transformIgnorePatterns: [
    "node_modules/(?!(" +
      "(jest-)?react-native" +
      "|@react-native(-community)?" +
      "|expo(nent)?" +
      "|@expo(nent)?/.*" +
      "|react-navigation" +
      "|@react-navigation/.*" +
      "|react-native-(svg|reanimated|gesture-handler|screens|safe-area-context)" +
      "|react-native-worklets-core" +
    "))",
  ],
  // tsconfig.json'daki @/* alias'ını Jest'e tanıt
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: [
    "**/__tests__/**/*.{ts,tsx}",
    "**/*.{spec,test}.{ts,tsx}",
  ],
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "!**/*.d.ts",
  ],
};
