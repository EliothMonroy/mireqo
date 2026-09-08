/* global __dirname */
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
// TypeBox 0.33's ESM Object export shadows Metro's generated Object.defineProperty
// shim. Its published CommonJS entry avoids that collision without changing the
// shared backend-compatible version or other packages' export resolution.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === '@sinclair/typebox' ||
    moduleName.startsWith('@sinclair/typebox/')
  ) {
    return context.resolveRequest(
      {
        ...context,
        isESMImport: false,
        unstable_conditionNames: context.unstable_conditionNames.filter(
          (name) => name !== 'import',
        ),
      },
      moduleName,
      platform,
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};
module.exports = config;
