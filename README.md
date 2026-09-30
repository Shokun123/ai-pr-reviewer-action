# 🛡️ AI PR Code Reviewer & Security Linter

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-AI--PR--Reviewer-blue?style=flat-square&logo=github)](https://github.com/marketplace)
[![CI & Self-Test](https://github.com/Shokun123/ai-pr-reviewer-action/actions/workflows/ci.yml/badge.svg)](https://github.com/Shokun123/ai-pr-reviewer-action/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node: 24](https://img.shields.io/badge/Node-24.x-green.svg?style=flat-square&logo=node.js)](#)
[![Binance Pay](https://img.shields.io/badge/Sponsor%20via-Binance%20Pay-F0B90B.svg?style=flat-square&logo=binance&logoColor=white)](#-pro-tier--binance-pay-licensing)

> **Automated AI code review, secret leak prevention, and vulnerability audit for every Pull Request.**  
> Catch leaked API keys, SQL injections, dangerous execution, and code smells before merging to production. Zero external dependencies, ultra-fast execution (< 3s).

---

## ⚡ Quick Start (Add in 30 Seconds)

Create a workflow file in your repository at `.github/workflows/ai_pr_review.yml`:

```yaml
name: AI PR Code Review & Security Audit

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write

jobs:
  security-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Run AI PR Reviewer
        uses: Shokun123/ai-pr-reviewer-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          fail-on-critical: false
```

---

## 🔍 What Does It Audit?

| Category | Vulnerabilities & Patterns Checked | Severity |
| :--- | :--- | :---: |
| **Secret Leaks** | AWS Access Keys (`AKIA...`), GitHub Tokens (`ghp_...`), Stripe Keys, Private Keys, Hardcoded Passwords | 🚨 **CRITICAL** |
| **Injection Flaws** | Raw SQL query string concatenation, unescaped queries | 🚨 **CRITICAL** |
| **Execution Risks** | Dynamic `eval()`, `new Function()`, synchronous unsafe subshells | 🟠 **HIGH** |
| **XSS Risks** | Unsanitized DOM injection (`innerHTML`, `dangerouslySetInnerHTML`) | 🟠 **HIGH** |
| **Code Smells** | Production console logs, empty `catch` blocks that swallow errors | 🟡 **MEDIUM** |

---

## 🛠️ Action Inputs & Configuration

| Input | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `github-token` | **Yes** | `${{ github.token }}` | Secret token used to read PR diffs and post review comments. |
| `fail-on-critical` | No | `false` | Set to `true` to block PR merging when critical leaks are discovered. |
| `license-key` | No | `""` | Pro license key or Binance transaction ID for unlimited enterprise audits. |
| `gemini-api-key` | No | `""` | Optional Google Gemini key for extended cognitive architectural advice. |

---

## 📋 Sample PR Review Comment

When a Pull Request is opened, the action posts an immediate inline audit comment:

```markdown
### 🚨 AI Code Review & Security Audit: CRITICAL ISSUES DETECTED
![Audit Status](https://img.shields.io/badge/Security_Audit-Failed-red?style=flat-square)

#### 🔍 Findings Summary
- **Critical Vulnerabilities:** 1
- **High Risk Flaws:** 0
- **Code Quality Smells:** 1

| Severity | Rule | File | Location | Recommendation |
| :---: | :--- | :--- | :--- | :--- |
| 🔴 `CRITICAL` | **Potential Hardcoded Secret** | `config/db.js` | Line 14 | Remove hardcoded credentials. Use GitHub Secrets. |
| 🟡 `MEDIUM` | **Console Log Found** | `src/auth.js` | Line 42 | Remove debug logging before merging. |
```

---

## 💎 Pro Tier & Binance Pay Licensing

The open-source version provides automated static security heuristics for every public and private repository.

### 🌟 Pro Features ($15 USDT Lifetime License):
* **Unlimited Deep Cognitive Reviews**
* **Custom Enterprise Rule Definitions & Policy Enforcement**
* **Direct Priority Discord/Telegram Support**

### How to Activate Pro:
1. Send **`$15 USDT`** via **Binance Pay** to:
   - **Binance UID:** `1049392123`
   - **Username:** `User-79a91`
2. Add your Binance Transaction ID (TXID) as the `license-key` in your GitHub Action workflow:
   ```yaml
   - uses: Shokun123/ai-pr-reviewer-action@v1
     with:
       github-token: ${{ secrets.GITHUB_TOKEN }}
       license-key: 'YOUR_BINANCE_TXID'
   ```

---

## 🌐 Complete $0-Overhead Developer Suite

Explore our other open-source production tools:
* 🗺️ **[Google Maps B2B Lead Extractor](https://github.com/Shokun123/google-maps-b2b-lead-scraper)** — High-performance Apify Actor for automated B2B lead generation with free sample datasets.
* 🛡️ **[LeadRescue AI](https://shokun123.github.io/leadrescue-ai/)** — Interactive Speed-to-Lead conversion audit & zero-latency lead routing engine.
* 💳 **Web3 Support:** Binance Pay UID: `1049392123` (`User-79a91`).

---

## 📄 License

Distributed under the **MIT License**. Free for open-source and individual developers.

