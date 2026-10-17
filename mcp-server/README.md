# 🐝 FlyCrawl Model Context Protocol (MCP) Server

[![npm version](https://img.shields.io/npm/v/flycrawl-mcp.svg)](https://www.npmjs.com/package/flycrawl-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TDQS Certified](https://img.shields.io/badge/TDQS_Certification-5%2F5_Stars-brightgreen.svg)](https://flycrawl.net/mcp-web-scraper)

Official Model Context Protocol (MCP) server for **FlyCrawl** — the high-performance Web-to-Markdown engine and AI crawling API. Directly connects Claude Desktop, Cursor AI, Windsurf, and autonomous LLM agents to the live web with zero token bloat and automatic anti-bot bypass.

---

## ⚡ Quick Start

### 1. Cursor IDE Setup
In Cursor: **Settings** -> **Features** -> **MCP Servers** -> **+ Add New MCP Server**:
- **Name**: `flycrawl`
- **Type**: `command`
- **Command**: `npx -y flycrawl-mcp`
- **Environment Variables**: `FLYCRAWL_API_KEY=fc_live_YOUR_API_KEY`

### 2. Claude Desktop Setup
Add this block to your `claude_desktop_config.json` (`%APPDATA%\Claude\claude_desktop_config.json` on Windows or `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "flycrawl": {
      "command": "npx",
      "args": ["-y", "flycrawl-mcp"],
      "env": {
        "FLYCRAWL_API_KEY": "fc_live_YOUR_API_KEY"
      }
    }
  }
}
```

---

## 🛠️ TDQS 5/5 Behavioral Disclosures & Tool Spec

Every FlyCrawl tool is certified with explicit behavioral disclosures, rate limits, side-effect boundaries, dynamic JS rendering specs, and zero-risk billing guarantees.

| Tool Name | Behavior & Idempotency | Dynamic JS / Anti-bot | Auth Required | Billing & Fair Guarantee | Scope & Difference |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `flycrawl_scrape` | Read-only, idempotent | Auto Playwright rendering + stealth residential proxies | `FLYCRAWL_API_KEY` | 1 credit/page. **0 credits on 4xx/5xx failures.** | Converts full page body to clean Fit-Markdown (90% token saving). |
| `flycrawl_crawl` | Read-only web traversal | Dynamic JS per page + domain boundary check | `FLYCRAWL_API_KEY` | 1 credit/page. **0 credits on failed pages.** | Traverses sub-pages recursively up to configured depth/limit. |
| `flycrawl_map` | Read-only reconnaissance | Headless sitemap + SPA route parsing | `FLYCRAWL_API_KEY` | 1 credit per domain mapping | Discovers URL structure in < 2s without downloading full page bodies. |
| `flycrawl_search` | Read-only web search | Real-time index without search engine ads | `FLYCRAWL_API_KEY` | 1 credit per search query | Searches live web and returns scraped top results in 1 atomic call. |
| `flycrawl_extract` | Read-only, idempotent | Dynamic JS rendering + schema validation | `FLYCRAWL_API_KEY` | 1 credit/call. **0 credits on failure.** | Extracts validated JSON conforming to your prompt and JSON schema. |

---

## 🛡️ Fair Billing Guarantee

- **0-Credit Deduction on Failures**: If an upstream target returns `404 Not Found`, `403 Forbidden`, `500 Server Error`, or times out, exactly **0 credits** are billed.
- **Structured Error Schema**: Failures return standard JSON indicating `{ isError: true, status: <CODE>, billed_credits: 0, retryable: boolean }`.
- **Free Credits**: Claim 100 free credits on sign up at [https://flycrawl.net](https://flycrawl.net).

---

## 📦 Canonical Package Ecosystem

- **TypeScript / Node.js SDK**: `npm install flycrawl`
- **MCP Server (npx)**: `npx -y flycrawl-mcp`
- **Python SDK**: `pip install flycrawl`
- **Official Documentation**: [https://flycrawl.net/docs](https://flycrawl.net/docs)

---

## 📄 License
MIT © FlyCrawl Core Team.
