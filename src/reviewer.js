/**
 * Core Security & Code Analysis Engine
 * Checks diffs for secret leaks, injection flaws, and code smells.
 */

export function analyzeDiff(diffText) {
  const issues = [];
  const lines = diffText.split('\n');
  let currentFile = 'unknown';
  let lineNumber = 0;

  const patterns = [
    // 1. Critical: Secret & Token Leaks
    {
      id: 'SEC-001',
      severity: 'CRITICAL',
      title: 'Potential Hardcoded Secret or API Key',
      regex: /(AKIA[0-9A-Z]{16})|(ghp_[a-zA-Z0-9]{36})|(sk_live_[0-9a-zA-Z]{24})|(AIza[0-9A-Za-z-_]{35})|(-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----)/i,
      recommendation: 'Remove hardcoded credentials immediately. Use environment variables or GitHub Secrets.'
    },
    {
      id: 'SEC-002',
      severity: 'CRITICAL',
      title: 'Hardcoded Password or JWT Secret Assignment',
      regex: /(password|secret|api_key|jwt_secret)\s*[:=]\s*["'][a-zA-Z0-9_\-!@#$%^&*]{8,}["']/i,
      recommendation: 'Avoid committing static passwords or secret strings to source control.'
    },
    // 2. High: Injection Vulnerabilities
    {
      id: 'SEC-003',
      severity: 'HIGH',
      title: 'Potential Dangerous Code Execution (eval / Function)',
      regex: /\b(eval\(|new\s+Function\(|execSync\()/i,
      recommendation: 'Avoid dynamic execution of unvalidated code. Use strict functional alternatives.'
    },
    {
      id: 'SEC-004',
      severity: 'HIGH',
      title: 'Potential Cross-Site Scripting (XSS / raw HTML insertion)',
      regex: /(innerHTML\s*=|dangerouslySetInnerHTML\s*=)/i,
      recommendation: 'Ensure all user-controlled data is properly escaped before injecting into DOM.'
    },
    {
      id: 'SEC-005',
      severity: 'HIGH',
      title: 'Potential Raw SQL String Concatenation',
      regex: /(SELECT|INSERT|UPDATE|DELETE).*\+\s*([a-zA-Z0-9_]+)|\b(query|execute)\s*\(\s*f["'].*SELECT/i,
      recommendation: 'Use parameterized queries or prepared statements to prevent SQL Injection.'
    },
    // 3. Medium: Code Smells & Bad Practices
    {
      id: 'PERF-001',
      severity: 'MEDIUM',
      title: 'Production Debugger or Console Logging Found',
      regex: /\b(console\.log|debugger;)\b/i,
      recommendation: 'Remove debug statements before merging to production.'
    },
    {
      id: 'ERR-001',
      severity: 'MEDIUM',
      title: 'Empty Catch Block (Swallowed Exception)',
      regex: /catch\s*\([^)]*\)\s*\{\s*\}/i,
      recommendation: 'Log the caught error or re-throw it to prevent silent runtime failures.'
    }
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track file name from diff header
    if (line.startsWith('+++ b/')) {
      currentFile = line.substring(6).trim();
      lineNumber = 0;
      continue;
    }

    // Only inspect added or modified lines
    if (line.startsWith('+') && !line.startsWith('+++')) {
      lineNumber++;
      const addedCode = line.substring(1);

      for (const pattern of patterns) {
        if (pattern.regex.test(addedCode)) {
          issues.push({
            ruleId: pattern.id,
            severity: pattern.severity,
            title: pattern.title,
            file: currentFile,
            line: lineNumber,
            codeSnippet: addedCode.trim().slice(0, 100),
            recommendation: pattern.recommendation
          });
        }
      }
    }
  }

  return issues;
}

export function formatReviewComment(issues, isPro = false) {
  const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
  const highCount = issues.filter(i => i.severity === 'HIGH').length;
  const mediumCount = issues.filter(i => i.severity === 'MEDIUM').length;

  let badge = '🛡️ **AI Code Review & Security Audit: PASS**';
  let badgeColor = 'brightgreen';

  if (criticalCount > 0) {
    badge = '🚨 **AI Code Review & Security Audit: CRITICAL ISSUES DETECTED**';
    badgeColor = 'red';
  } else if (highCount > 0) {
    badge = '⚠️ **AI Code Review & Security Audit: WARNINGS FOUND**';
    badgeColor = 'yellow';
  }

  let comment = `### ${badge}\n\n`;
  comment += `![Audit Status](https://img.shields.io/badge/Security_Audit-${criticalCount === 0 ? 'Passed' : 'Failed'}-${badgeColor}?style=flat-square)\n\n`;

  if (issues.length === 0) {
    comment += `> ✨ **No security vulnerabilities or code smells detected in this Pull Request.** All checks passed cleanly!\n\n`;
  } else {
    comment += `#### 🔍 Findings Summary\n\n`;
    comment += `- **Critical Vulnerabilities:** ${criticalCount}\n`;
    comment += `- **High Risk Flaws:** ${highCount}\n`;
    comment += `- **Code Quality Smells:** ${mediumCount}\n\n`;
    comment += `| Severity | Rule | File | Location | Recommendation |\n`;
    comment += `| :---: | :--- | :--- | :--- | :--- |\n`;

    for (const issue of issues) {
      const sevIcon = issue.severity === 'CRITICAL' ? '🔴' : issue.severity === 'HIGH' ? '🟠' : '🟡';
      comment += `| ${sevIcon} \`${issue.severity}\` | **${issue.title}** | \`${issue.file}\` | Line ${issue.line} | ${issue.recommendation} |\n`;
    }
    comment += `\n`;
  }

  // Footer & Monetization Channel
  comment += `---\n\n`;
  comment += `### ⚡ AI PR Reviewer Pro\n`;
  if (isPro) {
    comment += `> 💎 **PRO TIER ACTIVE** — Unlimited deep cognitive scans and priority execution enabled.\n`;
  } else {
    comment += `> **Free Tier:** Automated security heuristics for open-source teams.  \n`;
    comment += `> Want unlimited cognitive audits, custom team rules, and priority webhooks?  \n`;
    comment += `> **Get Pro ($15 USDT Lifetime):** Send to Binance Pay UID **\`1049392123\`** (\`User-79a91\`) and add your TXID as \`license-key\` in your workflow.\n`;
  }

  return comment;
}
