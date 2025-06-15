const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  tslib: path.resolve(__dirname, 'node_modules/tslib'),
};

config.resolver.unstable_enablePackageExports = false;

module.exports = config;

