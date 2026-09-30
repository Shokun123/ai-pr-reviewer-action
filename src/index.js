import fs from 'fs';
import https from 'https';
import { analyzeDiff, formatReviewComment } from './reviewer.js';

async function run() {
  console.log('🚀 Starting AI PR Code Reviewer & Security Linter...');

  const token = process.env.INPUT_GITHUB_TOKEN || process.env['INPUT_GITHUB-TOKEN'] || process.env.GITHUB_TOKEN;
  const failOnCritical = (process.env.INPUT_FAIL_ON_CRITICAL || process.env['INPUT_FAIL-ON-CRITICAL'] || 'false').toLowerCase() === 'true';
  const licenseKey = process.env.INPUT_LICENSE_KEY || process.env['INPUT_LICENSE-KEY'] || '';
  const eventPath = process.env.GITHUB_EVENT_PATH;
  const repository = process.env.GITHUB_REPOSITORY;

  if (!eventPath || !fs.existsSync(eventPath)) {
    console.log('[!] Warning: Not running in an official GitHub Action PR context (GITHUB_EVENT_PATH missing).');
    console.log('[!] Simulating standalone security scan on local diff if available...');
    return;
  }

  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
  const pr = eventData.pull_request;

  if (!pr) {
    console.log('[!] Action was not triggered by a pull_request event. Exiting safely.');
    return;
  }

  const prNumber = pr.number;
  const diffUrl = pr.diff_url;

  console.log(`[*] Target Repository: ${repository}`);
  console.log(`[*] Pull Request Number: #${prNumber}`);
  console.log(`[*] Fetching Diff from: ${diffUrl}`);

  // Fetch PR Diff
  let diffContent = '';
  try {
    diffContent = await fetchUrl(diffUrl, token);
  } catch (err) {
    console.error(`[-] Failed to fetch PR diff: ${err.message}`);
    process.exit(1);
  }

  // Analyze Diff
  const isPro = !!(licenseKey && licenseKey.length > 5);
  const issues = analyzeDiff(diffContent);
  const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;

  console.log(`[+] Analysis complete: ${issues.length} total findings (${criticalCount} critical).`);

  // Format Comment
  const commentBody = formatReviewComment(issues, isPro);

  // Post Comment to GitHub PR
  if (token && repository) {
    try {
      await postComment(repository, prNumber, commentBody, token);
      console.log(`[✓] Review comment posted successfully to PR #${prNumber}`);
    } catch (err) {
      console.error(`[-] Could not post review comment: ${err.message}`);
    }
  }

  // Write Action Outputs to $GITHUB_OUTPUT
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `review-status=${criticalCount === 0 ? 'clean' : 'issues-found'}\n`);
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `critical-issues-count=${criticalCount}\n`);
  }

  // Fail build if configured and critical issues exist
  if (failOnCritical && criticalCount > 0) {
    console.error(`🚨 Build failed: ${criticalCount} critical security issues detected in PR #${prNumber}.`);
    process.exit(1);
  }

  console.log('[✓] AI PR Reviewer finished successfully.');
}

function fetchUrl(url, token) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: {
        'User-Agent': 'AI-PR-Reviewer-Action',
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3.diff'
      }
    };

    https.get(options, (res) => {
      // Handle redirect if any
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, { headers: { 'User-Agent': 'AI-PR-Reviewer-Action' } }, (resRedirect) => {
          let data = '';
          resRedirect.on('data', chunk => data += chunk);
          resRedirect.on('end', () => resolve(data));
        }).on('error', reject);
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function postComment(repository, prNumber, body, token) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ body });
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${repository}/issues/${prNumber}/comments`,
      method: 'POST',
      headers: {
        'User-Agent': 'AI-PR-Reviewer-Action',
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(resData);
        } else {
          reject(new Error(`GitHub API returned HTTP ${res.statusCode}: ${resData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

run();
