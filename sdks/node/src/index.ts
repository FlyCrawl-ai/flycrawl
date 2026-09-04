export interface FlyCrawlOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface ScrapeOptions {
  url: string;
  formats?: ('markdown' | 'html' | 'rawHtml' | 'links' | 'summary')[];
  onlyMainContent?: boolean;
  waitFor?: number;
  includeTags?: string[];
  excludeTags?: string[];
  maxAge?: number;
}

export interface ScrapeResult {
  success: boolean;
  markdown?: string;
  fitMarkdown?: string;
  html?: string;
  rawHtml?: string;
  links?: string[];
  metadata: {
    title?: string;
    description?: string;
    language?: string;
    sourceURL?: string;
    statusCode?: number;
    error?: string;
  };
  cached?: boolean;
  warning?: string;
}

export interface CrawlOptions {
  url: string;
  maxDepth?: number;
  limit?: number;
  allowBackwardCrawling?: boolean;
  allowExternalLinks?: boolean;
}

export interface CrawlJob {
  success: boolean;
  id: string;
  url?: string;
}

export interface CrawlStatus {
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  total: number;
  completed: number;
  creditsUsed?: number;
  expiresAt?: string;
  data: ScrapeResult[];
}

export class FlyCrawl {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(options: FlyCrawlOptions) {
    if (!options.apiKey) {
      throw new Error("FlyCrawl API Key is required. Get one at https://flycrawl.net");
    }
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl || "https://flycrawl.net").replace(/\/$/, "");
    this.timeout = options.timeout || 60000;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "User-Agent": "FlyCrawl-Node-SDK/1.0.0",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`FlyCrawl API Error [${response.status}]: ${errorBody}`);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Scrapes a single webpage into clean, LLM-ready markdown or HTML.
   */
  async scrape(options: ScrapeOptions): Promise<ScrapeResult> {
    const res = await this.request<{ data: ScrapeResult } | ScrapeResult>("/api/v1/scrape", {
      method: "POST",
      body: JSON.stringify({
        url: options.url,
        formats: options.formats || ["markdown"],
        onlyMainContent: options.onlyMainContent ?? true,
        waitFor: options.waitFor || 0,
        includeTags: options.includeTags,
        excludeTags: options.excludeTags,
        maxAge: options.maxAge,
      }),
    });

    return ("data" in res && res.data) ? res.data : (res as ScrapeResult);
  }

  /**
   * Starts an asynchronous crawl of a website.
   */
  async crawl(options: CrawlOptions): Promise<CrawlJob> {
    return await this.request<CrawlJob>("/api/v1/crawl", {
      method: "POST",
      body: JSON.stringify({
        url: options.url,
        maxDepth: options.maxDepth ?? 2,
        limit: options.limit ?? 100,
        allowBackwardCrawling: options.allowBackwardCrawling ?? false,
        allowExternalLinks: options.allowExternalLinks ?? false,
      }),
    });
  }

  /**
   * Retrieves the current progress or finished results of a crawl job.
   */
  async getCrawlStatus(jobId: string): Promise<CrawlStatus> {
    return await this.request<CrawlStatus>(`/api/v1/crawl/status/${jobId}`, {
      method: "GET",
    });
  }

  /**
   * Polls until the crawl job is finished.
   */
  async waitForCrawl(jobId: string, pollIntervalMs = 2000, timeoutMs = 300000): Promise<CrawlStatus> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const status = await this.getCrawlStatus(jobId);
      if (status.status === "completed" || status.status === "failed" || status.status === "cancelled") {
        return status;
      }
      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }
    throw new Error(`Crawl job ${jobId} timed out after ${timeoutMs}ms`);
  }

  /**
   * Fast domain sitemap / URL exploration.
   */
  async map(url: string, search?: string, limit = 5000): Promise<string[]> {
    const res = await this.request<{ links: string[] }>("/api/v1/map", {
      method: "POST",
      body: JSON.stringify({ url, search, limit }),
    });
    return res.links || [];
  }

  /**
   * Extracts structured JSON data matching a schema or prompt from web pages.
   */
  async extract<T = any>(options: { urls: string[]; prompt?: string; schema?: Record<string, any> }): Promise<T> {
    return await this.request<T>("/api/v1/extract", {
      method: "POST",
      body: JSON.stringify(options),
    });
  }
}

export default FlyCrawl;
