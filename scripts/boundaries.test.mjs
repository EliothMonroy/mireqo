import assert from 'node:assert/strict';
import test from 'node:test';
import { ESLint } from 'eslint';

const linter = new ESLint();
async function violations(code, filePath) {
  const [result] = await linter.lintText(code, { filePath });
  return result.messages.filter((m) => m.ruleId === 'mireqo/boundaries');
}

test('blocks cross-feature imports including relative paths and re-exports', async () => {
  assert.equal(
    (
      await violations(
        "export { default } from '../search/SearchScreen';",
        'src/features/discover/example.ts',
      )
    ).length,
    1,
  );
  assert.equal(
    (
      await violations(
        "import Screen from '@/features/search/SearchScreen';",
        'src/features/discover/example.ts',
      )
    ).length,
    1,
  );
});
test('keeps shared UI independent from data and domain independent from native APIs', async () => {
  assert.equal(
    (
      await violations(
        "import data from '@/data/catalog';",
        'src/ui/example.ts',
      )
    ).length,
    1,
  );
  assert.equal(
    (
      await violations(
        "import { Platform } from 'react-native';",
        'src/domain/example.ts',
      )
    ).length,
    1,
  );
});
test('permits routes to compose features and features to use shared UI', async () => {
  assert.equal(
    (
      await violations(
        "export { default } from '@/features/foundation/FoundationScreen';",
        'src/app/example.ts',
      )
    ).length,
    0,
  );
  assert.equal(
    (
      await violations(
        "import { colors } from '@/ui/theme';",
        'src/features/foundation/example.ts',
      )
    ).length,
    0,
  );
});
