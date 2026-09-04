"""
FlyCrawl Quickstart Example: Scrape to Fit-Markdown
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Scrapes a single page into LLM-optimized markdown with stripped ads and noise.
"""
import os
from flycrawl import FlyCrawl

api_key = os.getenv("FLYCRAWL_API_KEY", "fc_live_demo")
client = FlyCrawl(api_key=api_key)

url = "https://news.ycombinator.com"
print(f"Scraping {url} ...")

result = client.scrape(
    url=url,
    formats=["markdown"],
    only_main_content=True
)

print("\n--- METADATA ---")
print(f"Title: {result.metadata.title}")
print(f"Status: {result.metadata.statusCode}")

print("\n--- EXTRACTED FIT-MARKDOWN (First 300 chars) ---")
print(result.markdown[:300])
