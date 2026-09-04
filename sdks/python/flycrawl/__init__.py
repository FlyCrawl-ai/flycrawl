"""
FlyCrawl Python SDK
~~~~~~~~~~~~~~~~~~~
High-performance web scraping and markdown extraction engine built for LLMs and AI workflows.
"""

from .client import FlyCrawl, AsyncFlyCrawl, ScrapeResponse, CrawlJobResponse

__version__ = "1.0.0"
__all__ = ["FlyCrawl", "AsyncFlyCrawl", "ScrapeResponse", "CrawlJobResponse"]
