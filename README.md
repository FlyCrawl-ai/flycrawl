# 🔥 FlyCrawl

<div align="center">

**The High-Performance, Anti-Bot Resilient Web Scraping & LLM Markdown Extraction Engine**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Python SDK](https://img.shields.io/badge/Python-3.9%2B-blue?style=flat-square&logo=python)](sdks/python)
[![Node / TypeScript SDK](https://img.shields.io/badge/TypeScript-5.0%2B-3178C6?style=flat-square&logo=typescript)](sdks/node)
[![MCP Protocol](https://img.shields.io/badge/Model_Context_Protocol-Ready-purple?style=flat-square)](mcp-server)
[![Benchmarks](https://img.shields.io/badge/Benchmarks-10x%20Faster-success?style=flat-square)](https://flycrawl.net)
[![Cloudflare Bypass](https://img.shields.io/badge/Anti--Bot%20Bypass-99.4%25-orange?style=flat-square)](https://flycrawl.net)

[Documentation](https://flycrawl.net/docs) • [Get API Key](https://flycrawl.net) • [Python SDK](#-python-sdk) • [Node / TypeScript SDK](#-node--typescript-sdk) • [Claude & Cursor MCP](#-model-context-protocol-mcp-server)

</div>

---

## ⚡ What is FlyCrawl?

**FlyCrawl** turns the entire web into clean, noise-free, LLM-ready markdown and structured JSON data. 

Built with a battle-tested high-concurrency engine (Go & .NET 9 Core), FlyCrawl operates up to **10x faster** with an **85% smaller memory footprint** than traditional Chromium-heavy crawlers. It transparently handles JavaScript rendering, solves anti-bot challenges (Cloudflare Turnstile, DataDome, Akamai), rotates intelligent residential proxies, and strips ads, navigation, and trackers to deliver crisp content directly to your AI pipelines.

---

## 📊 Benchmark Comparison

| Feature / Metric | 🚀 **FlyCrawl** | **Firecrawl** | **Crawl4AI** | **Jina Reader** |
| :--- | :---: | :---: | :---: | :---: |
| **Engine Architecture** | **High-Throughput Go / .NET 9 Core** | Node.js / Puppeteer | Python / Playwright | Cloud Relay |
| **P95 Latency (Cached / Raw)** | **< 65ms / 320ms** | 1,200ms / 2,800ms | 850ms / 2,100ms | 450ms / 1,400ms |
| **Memory Footprint per Scrape** | **~18 MB** | ~180 MB | ~150 MB | Cloud |
| **Anti-Bot Defenses** | **Native TLS Fingerprint & Stealth Canvas** | Basic Headless | Basic Playwright | Cloud Proxy |
| **Token Optimization (Fit-Markdown)**| **Built-in Semantic Noise Stripper (up to 70% fewer tokens)** | Standard Markdown | LLM-Assisted | Standard |
| **Enterprise Fair-Share Queue** | **Zero-Starvation Tenant Sharding** | Redis FIFO | In-Process Event Loop | Cloud Queues |
| **Official Model Context Protocol (MCP)**| **Official Claude / Cursor Native MCP** | Community | ❌ | ❌ |
| **Deep Site Mapping (Fast Sitemap/URL discovery)**| **Sub-second Parallel Discovery** | Moderate | Slow | ❌ |

---

## 📦 Quick Start

### 1. cURL

```bash
curl -X POST https://flycrawl.net/api/v1/scrape \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://news.ycombinator.com",
    "formats": ["markdown"],
    "onlyMainContent": true
  }'
```

---

### 🐍 Python SDK

Install the official Python client:

```bash
pip install flycrawl-py
```

#### Scrape a Single Page
```python
from flycrawl import FlyCrawl

client = FlyCrawl(api_key="fc_live_...")

# Fast, clean markdown extraction
doc = client.scrape(
    url="https://en.wikipedia.org/wiki/Artificial_intelligence",
    formats=["markdown"],
    only_main_content=True
)

print(f"Title: {doc.metadata.title}")
print(doc.markdown[:500])
```

#### Asynchronous Full-Site Crawl
```python
import asyncio
from flycrawl import AsyncFlyCrawl

async def main():
    async with AsyncFlyCrawl(api_key="fc_live_...") as client:
        job = await client.crawl(
            url="https://docs.example.com",
            max_depth=3,
            limit=50
        )
        print(f"Crawl job started: {job.id}")
        
        # Poll results until completion
        results = await client.wait_for_crawl(job.id)
        for page in results.data:
            print(f"Crawled: {page.url} ({len(page.markdown)} chars)")

asyncio.run(main())
```

---

### ☕ Node / TypeScript SDK

Install via npm:

```bash
npm install @flycrawl/sdk
```

```typescript
import { FlyCrawl } from '@flycrawl/sdk';

const flycrawl = new FlyCrawl({
  apiKey: process.env.FLYCRAWL_API_KEY
});

async function run() {
  const result = await flycrawl.scrape({
    url: 'https://github.com/trending',
    formats: ['markdown', 'links'],
    onlyMainContent: true
  });

  console.log('Page Title:', result.metadata.title);
  console.log('Markdown Content:\n', result.markdown);
}

run();
```

---

## 🤖 Model Context Protocol (MCP) Server

Connect FlyCrawl directly to **Claude Desktop**, **Cursor**, **Windsurf**, or any MCP-compatible AI workspace. Give your LLM real-time internet browsing, scraping, and documentation indexing capabilities with zero token waste.

### Claude Desktop Configuration

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "flycrawl": {
      "command": "npx",
      "args": ["-y", "@flycrawl/mcp-server"],
      "env": {
        "FLYCRAWL_API_KEY": "fc_live_YOUR_API_KEY"
      }
    }
  }
}
```

### Supported MCP Tools:
- `flycrawl_scrape`: Scrapes any URL and converts it to clean, concise markdown.
- `flycrawl_crawl`: Initiates a multi-page crawl of docs or articles.
- `flycrawl_search`: Searches the web for fresh data and extracts the top relevant pages.
- `flycrawl_map`: Maps out all reachable URLs in a domain under 2 seconds.

---

## 🛡️ Enterprise Security & Hardening

FlyCrawl is engineered from the ground up for mission-critical production environments:

- **Socket-Level SSRF Guard**: Zero-window protection against DNS Rebinding (`TTL=0`) and Cloud metadata endpoint exploitation (`169.254.169.254`, loopback, internal CIDR blocks).
- **Global ReDoS Shield**: Regular expressions bound by strict 2-second timeout guarantees across all parser pipelines.
- **Fair-Share Tenant Scheduling**: Isolated virtual buckets prevent noisy neighbors or malicious API spammers from starving other workloads.
- **Process Sandbox**: Subprocesses are isolated in bounded trees and terminated gracefully (`proc.Kill(entireProcessTree: true)`) on request cancellation to eliminate orphaned resource leaks.

---

## 📄 License

This repository and all SDKs are distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.

---

<div align="center">
  <sub>Built for the AI era by the FlyCrawl Core Team. <a href="https://flycrawl.net">flycrawl.net</a></sub>
</div>
