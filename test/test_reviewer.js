import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeDiff, formatReviewComment } from '../src/reviewer.js';

test('AI PR Reviewer - Core Analysis Engine Tests', async (t) => {
  await t.test('detects critical AWS & GitHub token leaks', () => {
    const maliciousDiff = `
diff --git a/config.js b/config.js
--- a/config.js
+++ b/config.js
@@ -1,3 +1,4 @@
 const config = {
+  awsKey: "AKIAIOSFODNN7EXAMPLE",
+  ghToken: "ghp_1234567890abcdef1234567890abcdef1234"
 };
`;
    const issues = analyzeDiff(maliciousDiff);
    assert.equal(issues.length, 2);
    assert.equal(issues[0].severity, 'CRITICAL');
    assert.equal(issues[0].ruleId, 'SEC-001');
  });

  await t.test('detects injection and dangerous eval execution', () => {
    const injectionDiff = `
diff --git a/app.js b/app.js
--- a/app.js
+++ b/app.js
@@ -10,3 +10,4 @@
 function runCode(userInput) {
+  eval(userInput);
+  const query = "SELECT * FROM users WHERE id = " + userInput;
 }
`;
    const issues = analyzeDiff(injectionDiff);
    assert.ok(issues.some(i => i.ruleId === 'SEC-003'), 'Should detect eval');
    assert.ok(issues.some(i => i.ruleId === 'SEC-005'), 'Should detect SQL concatenation');
  });

  await t.test('clean diffs pass with 0 issues', () => {
    const cleanDiff = `
diff --git a/math.js b/math.js
--- a/math.js
+++ b/math.js
@@ -1,3 +1,4 @@
 export function add(a, b) {
+  return a + b;
 }
`;
    const issues = analyzeDiff(cleanDiff);
    assert.equal(issues.length, 0);
    const comment = formatReviewComment(issues, false);
    assert.ok(comment.includes('PASS'));
    assert.ok(comment.includes('1049392123'), 'Must feature Binance Pay UID');
  });

  await t.test('formats Pro tier comment properly', () => {
    const comment = formatReviewComment([], true);
    assert.ok(comment.includes('PRO TIER ACTIVE'));
  });
});
