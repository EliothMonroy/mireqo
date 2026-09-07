/* global __dirname */
const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');
const path = require('node:path');

const boundaryRule = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      boundary:
        'Import violates architecture.md: {{from}} cannot depend on {{to}}.',
    },
  },
  create(context) {
    const root = path.join(__dirname, 'src');
    const source = path.relative(root, context.filename).split(path.sep);
    function check(node) {
      if (typeof node.value !== 'string') return;
      const value = node.value;
      const target = value.startsWith('@/')
        ? path.join(root, value.slice(2))
        : value.startsWith('.')
          ? path.resolve(path.dirname(context.filename), value)
          : null;
      const parts = target ? path.relative(root, target).split(path.sep) : [];
      const [from, feature] = source;
      const [to, targetFeature] = parts;
      const shared = ['domain', 'data', 'ui'];
      const forbidden =
        (shared.includes(from) &&
          ['features', 'app', 'bootstrap'].includes(to)) ||
        (from === 'features' &&
          (['app', 'bootstrap'].includes(to) ||
            (to === 'features' && feature !== targetFeature))) ||
        (from === 'domain' &&
          (target
            ? to !== 'domain'
            : /^(react($|\/)|react-native($|[-\/])|expo($|[-\/])|@expo\/|@react-native\/|@tanstack\/react-query|node:)/.test(
                value,
              ))) ||
        (from === 'ui' && to === 'data') ||
        (from === 'data' && to === 'ui');
      if (forbidden)
        context.report({
          node,
          messageId: 'boundary',
          data: { from, to: target ? parts.join('/') : value },
        });
    }
    return {
      ImportDeclaration: (node) => check(node.source),
      ExportNamedDeclaration: (node) => node.source && check(node.source),
      ExportAllDeclaration: (node) => check(node.source),
      ImportExpression: (node) => check(node.source),
      CallExpression: (node) => {
        if (node.callee.name === 'require' && node.arguments[0])
          check(node.arguments[0]);
      },
    };
  },
};

module.exports = defineConfig([
  expo,
  {
    ignores: [
      'android/**',
      'ios/**',
      'vendor/**',
      '.bundle/**',
      '.worktrees/**',
      '.expo/**',
      'coverage/**',
      'dist/**',
    ],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { mireqo: { rules: { boundaries: boundaryRule } } },
    rules: { 'mireqo/boundaries': 'error' },
  },
]);
