const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const flowApiClient = path.resolve(__dirname, 'packages/flow-api-client');

const config = {
  watchFolders: [flowApiClient],
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
