# 🐍 FlyCrawl Python SDK (`flycrawl-py`)

Official Python SDK for [FlyCrawl](https://flycrawl.net) — the high-performance, anti-bot resilient web scraping and LLM markdown extraction engine.

## 📦 Installation

```bash
pip install flycrawl-py
```

## 🚀 Quickstart

### 1. Basic Single-Page Scrape
```python
from flycrawl import FlyCrawl

client = FlyCrawl(api_key="fc_live_YOUR_KEY")

result = client.scrape(
    url="https://news.ycombinator.com",
    formats=["markdown"],
    only_main_content=True
)

print(result.markdown)
```

### 2. High-Throughput Batch Scraping
```python
from flycrawl import FlyCrawl

client = FlyCrawl(api_key="fc_live_YOUR_KEY")

pages = client.batch_scrape(
    urls=[
        "https://example.com/page1",
        "https://example.com/page2",
        "https://example.com/page3"
    ],
    formats=["markdown"]
)

for p in pages:
    print(f"Title: {p.metadata.title} ({len(p.markdown)} chars)")
```

### 3. Strongly-Typed Extraction (Pydantic)
```python
from pydantic import BaseModel, Field
from flycrawl import FlyCrawl

class Product(BaseModel):
    title: str
    price: float
    currency: str
    in_stock: bool

client = FlyCrawl(api_key="fc_live_YOUR_KEY")

data = client.extract(
    urls=["https://store.example.com/item/123"],
    schema=Product,
    prompt="Extract the product title, price, currency, and stock status."
)
print(data)
```

### 4. Asynchronous Full-Site Crawl
```python
import asyncio
from flycrawl import AsyncFlyCrawl

async def main():
    async with AsyncFlyCrawl(api_key="fc_live_YOUR_KEY") as client:
        job = await client.crawl("https://docs.example.com", max_depth=2, limit=50)
        status = await client.wait_for_crawl(job.id)
        print(f"Crawled {status.completed} pages.")

asyncio.run(main())
```

## 📄 License
MIT License.
