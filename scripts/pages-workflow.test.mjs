import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const workflowPath = path.join(repositoryRoot, '.github/workflows/static.yml');
const publicDir = path.join(repositoryRoot, 'apps/website/public');

test('Pages workflow publishes the website public directory, not the repository root', () => {
  const workflow = readFileSync(workflowPath, 'utf8');
  assert.match(workflow, /path:\s*apps\/website\/public/);
  assert.doesNotMatch(workflow, /Upload entire repository/);
  assert.doesNotMatch(workflow, /path:\s*['"]\.['"]/);
  assert.match(workflow, /node --test apps\/website\/test\/page\.test\.mjs/);
  assert.match(workflow, /node-version:\s*['"]?24\.20\.0['"]?/);
  assert.equal(existsSync(path.join(publicDir, 'index.html')), true);
});
