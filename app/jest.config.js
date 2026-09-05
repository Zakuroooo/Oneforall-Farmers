module.exports = {
  preset: 'react-native',
  // The RN preset's default transformIgnorePatterns only exempts react-native
  // itself. Several of our dependencies ship untranspiled ESM (`export` syntax)
  // and need whitelisting too, or Jest tries to run them as CommonJS and dies on
  // the first `export` keyword — which is what __tests__/App.test.tsx hit here.
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-.*)/)',
  ],
  // AsyncStorage's native module does not exist under Jest (no real device or
  // emulator backs it) — jest.setup.js registers the package's own mock object.
  setupFiles: ['<rootDir>/jest.setup.js'],
};
