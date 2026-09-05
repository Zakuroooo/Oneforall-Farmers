/**
 * Runs before every test file. The AsyncStorage package ships a mock object at
 * .../jest/async-storage-mock, but it is just an exported object — something
 * still has to call jest.mock() to swap it in for the native module, which is
 * this file's only job.
 */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
