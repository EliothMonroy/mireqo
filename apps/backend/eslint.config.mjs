import tsParser from '@typescript-eslint/parser';
export default [
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tsParser },
    rules: {
      'no-debugger': 'error',
      'no-constant-condition': 'error',
      'no-restricted-imports': [
        'error',
        { patterns: ['@mireqo/mobile', '**/apps/mobile/**'] },
      ],
    },
  },
];
