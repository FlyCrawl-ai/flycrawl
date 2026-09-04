from typing import List, Optional, Dict, Any, Union
import time
import httpx
from pydantic import BaseModel, Field

DEFAULT_BASE_URL = "https://flycrawl.net"

class PageMetadata(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    sourceURL: Optional[str] = None
    statusCode: Optional[int] = 200
    error: Optional[str] = None

class ScrapeResponse(BaseModel):
    success: bool = True
    markdown: Optional[str] = None
    fit_markdown: Optional[str] = Field(default=None, alias="fitMarkdown")
    html: Optional[str] = None
    raw_html: Optional[str] = Field(default=None, alias="rawHtml")
    links: Optional[List[str]] = None
    metadata: PageMetadata = Field(default_factory=PageMetadata)
    cached: Optional[bool] = False
    warning: Optional[str] = None

class CrawlJobResponse(BaseModel):
    success: bool = True
    id: str
    url: Optional[str] = None

class CrawlStatusResponse(BaseModel):
    status: str
    total: int = 0
    completed: int = 0
    creditsUsed: Optional[int] = 0
    expiresAt: Optional[str] = None
    data: List[ScrapeResponse] = Field(default_factory=list)

class FlyCrawl:
    """Synchronous Client for FlyCrawl API."""

    def __init__(self, api_key: str, base_url: str = DEFAULT_BASE_URL, timeout: float = 60.0):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "FlyCrawl-Python-SDK/1.0.0"
        }
        self._client = httpx.Client(base_url=self.base_url, headers=self.headers, timeout=timeout)

    def scrape(
        self,
        url: str,
        formats: Optional[List[str]] = None,
        only_main_content: bool = True,
        wait_for: int = 0,
        include_tags: Optional[List[str]] = None,
        exclude_tags: Optional[List[str]] = None,
        max_age: Optional[int] = None
    ) -> ScrapeResponse:
        """Scrapes a URL and returns clean markdown, html, or structured data."""
        payload: Dict[str, Any] = {
            "url": url,
            "formats": formats or ["markdown"],
            "onlyMainContent": only_main_content,
            "waitFor": wait_for
        }
        if include_tags:
            payload["includeTags"] = include_tags
        if exclude_tags:
            payload["excludeTags"] = exclude_tags
        if max_age is not None:
            payload["maxAge"] = max_age

        res = self._client.post("/api/v1/scrape", json=payload)
        res.raise_for_status()
        data = res.json()
        payload_data = data.get("data", data)
        return ScrapeResponse(**payload_data)

    def crawl(
        self,
        url: str,
        max_depth: int = 2,
        limit: int = 100,
        allow_backward_crawling: bool = False,
        allow_external_links: bool = False
    ) -> CrawlJobResponse:
        """Starts an asynchronous site-wide crawl job."""
        payload = {
            "url": url,
            "maxDepth": max_depth,
            "limit": limit,
            "allowBackwardCrawling": allow_backward_crawling,
            "allowExternalLinks": allow_external_links
        }
        res = self._client.post("/api/v1/crawl", json=payload)
        res.raise_for_status()
        return CrawlJobResponse(**res.json())

    def get_crawl_status(self, job_id: str) -> CrawlStatusResponse:
        """Checks the current progress and results of a crawl job."""
        res = self._client.get(f"/api/v1/crawl/status/{job_id}")
        res.raise_for_status()
        return CrawlStatusResponse(**res.json())

    def wait_for_crawl(self, job_id: str, poll_interval: float = 2.0, timeout: float = 300.0) -> CrawlStatusResponse:
        """Polls until the crawl job is completed or times out."""
        start = time.time()
        while time.time() - start < timeout:
            status = self.get_crawl_status(job_id)
            if status.status in ("completed", "failed", "cancelled"):
                return status
            time.sleep(poll_interval)
        raise TimeoutError(f"Crawl job {job_id} did not finish within {timeout}s")

    def map(self, url: str, search: Optional[str] = None, limit: int = 5000) -> List[str]:
        """Discovers all internal URLs within a domain in seconds."""
        payload: Dict[str, Any] = {"url": url, "limit": limit}
        if search:
            payload["search"] = search
        res = self._client.post("/api/v1/map", json=payload)
        res.raise_for_status()
        data = res.json()
        return data.get("links", [])

    def search(self, query: str, limit: int = 5) -> Dict[str, Any]:
        """Searches the live web and extracts clean page summaries."""
        res = self._client.post("/api/v1/search", json={"query": query, "limit": limit})
        res.raise_for_status()
        return res.json()

    def close(self):
        self._client.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()


class AsyncFlyCrawl:
    """Asynchronous Client for FlyCrawl API."""

    def __init__(self, api_key: str, base_url: str = DEFAULT_BASE_URL, timeout: float = 60.0):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "FlyCrawl-Python-AsyncSDK/1.0.0"
        }
        self._client = httpx.AsyncClient(base_url=self.base_url, headers=self.headers, timeout=timeout)

    async def scrape(
        self,
        url: str,
        formats: Optional[List[str]] = None,
        only_main_content: bool = True,
        wait_for: int = 0
    ) -> ScrapeResponse:
        payload = {
            "url": url,
            "formats": formats or ["markdown"],
            "onlyMainContent": only_main_content,
            "waitFor": wait_for
        }
        res = await self._client.post("/api/v1/scrape", json=payload)
        res.raise_for_status()
        data = res.json()
        payload_data = data.get("data", data)
        return ScrapeResponse(**payload_data)

    async def crawl(self, url: str, max_depth: int = 2, limit: int = 100) -> CrawlJobResponse:
        payload = {"url": url, "maxDepth": max_depth, "limit": limit}
        res = await self._client.post("/api/v1/crawl", json=payload)
        res.raise_for_status()
        return CrawlJobResponse(**res.json())

    async def get_crawl_status(self, job_id: str) -> CrawlStatusResponse:
        res = await self._client.get(f"/api/v1/crawl/status/{job_id}")
        res.raise_for_status()
        return CrawlStatusResponse(**res.json())

    async def close(self):
        await self._client.aclose()

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        await self.close()
