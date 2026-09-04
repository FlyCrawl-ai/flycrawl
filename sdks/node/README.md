# ☕ FlyCrawl Node.js & TypeScript SDK (`@flycrawl/sdk`)

Official Node.js and TypeScript client for [FlyCrawl](https://flycrawl.net) — the high-performance, anti-bot resilient web scraping & LLM markdown extraction engine.

## 📦 Installation

```bash
npm install @flycrawl/sdk
# or
pnpm add @flycrawl/sdk
# or
yarn add @flycrawl/sdk
```

## 🚀 Quickstart

### 1. Basic Scrape
```typescript
import { FlyCrawl } from '@flycrawl/sdk';

const flycrawl = new FlyCrawl({ apiKey: process.env.FLYCRAWL_API_KEY! });

async function run() {
  const page = await flycrawl.scrape({
    url: 'https://news.ycombinator.com',
    formats: ['markdown'],
    onlyMainContent: true
  });

  console.log(page.markdown);
}

run();
```

### 2. High-Throughput Batch Scraping
```typescript
const batch = await flycrawl.batchScrape([
  'https://docs.example.com/getting-started',
  'https://docs.example.com/configuration'
]);

for (const doc of batch.data) {
  console.log(doc.metadata.title, doc.markdown?.length);
}
```

### 3. Structured Data Extraction
```typescript
const pricing = await flycrawl.extract({
  urls: ['https://stripe.com/pricing'],
  prompt: 'Extract all available plans and their monthly cost.',
  schema: {
    type: 'object',
    properties: {
      plans: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            price: { type: 'number' }
          }
        }
      }
    }
  }
});

console.log(pricing);
```

## 📄 License
MIT License.
