#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const apiKey = process.env.FLYCRAWL_API_KEY || "";
const baseUrl = (process.env.FLYCRAWL_BASE_URL || process.env.FLYCRAWL_API_URL || "https://flycrawl.net").replace(/\/$/, "");

if (!apiKey) {
    console.error("Warning: FLYCRAWL_API_KEY environment variable is not set. Requests will fail if authentication is required.");
}

const server = new Server(
    {
        name: "flycrawl-mcp-server",
        version: "1.0.1",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "flycrawl_scrape",
                description: "Scrape a single webpage and convert it into clean, noise-free, LLM-ready Fit-Markdown, JSON, or links with 90%+ token reduction.\n\nBEHAVIOR & SAFETY: Read-only and idempotent. Makes no modifications to target servers.\nAUTHENTICATION: Requires valid FLYCRAWL_API_KEY (claim 100 free credits at https://flycrawl.net).\nRATE LIMITS & BILLING: Consumes 1 credit per successful page scrape. Fair billing guarantee: 0 credits are deducted if the target site returns 4xx/5xx errors or network timeouts.\nDYNAMIC JS RENDERING: Automatically executes dynamic client-side JavaScript (SPAs, React, Vue, Angular) and bypasses anti-bot systems (Cloudflare Turnstile, DataDome) using stealth residential IP pools.\nDIFFERENCE FROM flycrawl_extract: flycrawl_scrape extracts the complete readable text and layout of the page as Markdown. Use flycrawl_extract when you need specific JSON fields conforming to a schema.\nERROR HANDLING: Returns structured error message with status code on failure without raising unhandled exceptions.",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: {
                            type: "string",
                            description: "The complete URL of the webpage to scrape (must start with http:// or https://).",
                        },
                        format: {
                            type: "string",
                            enum: ["markdown", "json", "links", "summary", "html"],
                            description: "Target output format ('markdown', 'json', 'links', 'summary', 'html'). Default: markdown.",
                            default: "markdown",
                        },
                        onlyMainContent: {
                            type: "boolean",
                            description: "Whether to strip navigation, headers, footers, and ads (default: true).",
                            default: true,
                        },
                        maxAge: {
                            type: "number",
                            description: "Cache TTL in seconds (default 86400 = 24h). Cached requests are instant and cost 0 credits.",
                            default: 86400,
                        },
                    },
                    required: ["url"],
                },
            },
            {
                name: "flycrawl_crawl",
                description: "Recursively crawl multiple pages of an entire website following internal links up to a configured depth and page limit.\n\nBEHAVIOR & SAFETY: Read-only web traversal. Strict domain boundary enforcement; will not traverse outside the target domain.\nAUTHENTICATION: Requires valid FLYCRAWL_API_KEY.\nRATE LIMITS & BILLING: Deducts 1 credit per successfully crawled page. 0 credits billed for failed pages.\nDYNAMIC JS RENDERING: Renders dynamic JavaScript on each crawled page with automated anti-bot bypass.\nDIFFERENCE FROM flycrawl_map: flycrawl_map only discovers URLs without downloading page contents; flycrawl_crawl fetches and converts full page bodies to Markdown.\nERROR HANDLING: Returns aggregated Markdown or structured error JSON on network or authentication failure.",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: {
                            type: "string",
                            description: "Starting root URL of the website to crawl.",
                        },
                        depth: {
                            type: "number",
                            description: "Maximum traversal depth from root (0-3). Default is 1.",
                            default: 1,
                        },
                        limit: {
                            type: "number",
                            description: "Maximum pages to crawl (1-50). Default is 10.",
                            default: 10,
                        },
                    },
                    required: ["url"],
                },
            },
            {
                name: "flycrawl_map",
                description: "Quickly discover and list all reachable internal URLs and sitemap hierarchy on a domain in under 2 seconds.\n\nBEHAVIOR & SAFETY: Read-only and non-destructive. Queries sitemaps, robots.txt, and top-level link graphs.\nAUTHENTICATION: Requires valid FLYCRAWL_API_KEY.\nRATE LIMITS & BILLING: Consumes 1 credit per domain mapping operation.\nDYNAMIC JS RENDERING: Headless DOM parsing for dynamically injected single-page application router links.\nDIFFERENCE FROM flycrawl_crawl: flycrawl_map returns only a list of discovered URLs (no content bodies), making it ideal for reconnaissance before targeted scraping.\nERROR HANDLING: Returns discovered URLs or structured error JSON.",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: {
                            type: "string",
                            description: "The target website domain to map (e.g. 'https://stripe.com').",
                        },
                        search: {
                            type: "string",
                            description: "Optional keyword to filter discovered URLs.",
                        },
                        limit: {
                            type: "number",
                            description: "Maximum URLs to return (default: 1000).",
                            default: 1000,
                        },
                    },
                    required: ["url"],
                },
            },
            {
                name: "flycrawl_search",
                description: "Search the live web and automatically scrape the top search results into clean, LLM-ready Markdown in a single call.\n\nBEHAVIOR & SAFETY: Read-only live web search.\nAUTHENTICATION: Requires valid FLYCRAWL_API_KEY.\nRATE LIMITS & BILLING: Consumes 1 credit per search request (includes top scraped result summaries).\nSEARCH QUALITY & FRESHNESS: Queries live web index with real-time freshness, strips search advertisements and sponsored links, and extracts substantive article content.\nDIFFERENCE FROM flycrawl_scrape: flycrawl_search finds relevant pages by query keyword; flycrawl_scrape requires a specific target URL.\nERROR HANDLING: Returns Markdown summary of results or structured error JSON.",
                inputSchema: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The search query terms to execute on the live web.",
                        },
                        limit: {
                            type: "number",
                            description: "Maximum number of search results to return (default: 5).",
                            default: 5,
                        },
                    },
                    required: ["query"],
                },
            },
            {
                name: "flycrawl_extract",
                description: "Extract typed, structured JSON entities from any live webpage using natural language guidance and an optional JSON Schema.\n\nBEHAVIOR & SAFETY: Read-only and idempotent. Makes no modifications to target servers. Safe for autonomous agents.\nAUTHENTICATION: Requires valid FLYCRAWL_API_KEY environment variable.\nRATE LIMITS & BILLING: Costs 1 credit per successful extraction. Fair billing guarantee: 0 credits are deducted if the target page fails to load, times out, or returns a 5xx error.\nDYNAMIC JS & HEADLESS BROWSING: Automatically executes dynamic client-side JavaScript (SPAs, React, Vue, Angular) and bypasses anti-bot systems (Cloudflare Turnstile, DataDome, Akamai) using stealth residential IP pools.\nDIFFERENCE FROM flycrawl_scrape: Unlike flycrawl_scrape (which returns the whole page converted to cleaned Fit-Markdown), flycrawl_extract uses an LLM to parse and transform the DOM into a validated JSON schema.\nERROR HANDLING: Returns { 'isError': true, 'code': '<HTTP_STATUS>', 'error': '<message>' } on network failure, timeout, or schema mismatch without raising unhandled exceptions.",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: {
                            type: "string",
                            description: "Target URL to extract data from (must start with http:// or https://).",
                        },
                        prompt: {
                            type: "string",
                            description: "Natural language instructions describing what specific data fields to extract.",
                        },
                        schema: {
                            type: "object",
                            description: "Optional JSON Schema definition for the extraction structure.",
                        },
                    },
                    required: ["url", "prompt"],
                },
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const reqHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "FlyCrawl-MCP/1.0.1",
    };
    if (apiKey) {
        reqHeaders["Authorization"] = `Bearer ${apiKey}`;
    }

    try {
        if (name === "flycrawl_scrape") {
            const { url, format = "markdown", onlyMainContent = true, maxAge = 86400 } = (args || {}) as any;
            const response = await fetch(`${baseUrl}/api/v1/scrape`, {
                method: "POST",
                headers: reqHeaders,
                body: JSON.stringify({
                    url,
                    format,
                    formats: [format],
                    onlyMainContent,
                    maxAge,
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                isError: true,
                                status: response.status,
                                error: `FlyCrawl Scrape Error [${response.status}]: ${errText}`,
                                billed_credits: 0,
                                retryable: response.status >= 500,
                            }, null, 2),
                        },
                    ],
                };
            }

            const resJson: any = await response.json();
            const markdown = resJson.content || resJson.data?.markdown || resJson.markdown || "No markdown content extracted.";
            const title = resJson.title || resJson.data?.metadata?.title || resJson.metadata?.title || url;
            return {
                content: [
                    {
                        type: "text",
                        text: `# ${title}\n\n${markdown}`,
                    },
                ],
            };
        }

        if (name === "flycrawl_crawl") {
            const { url, depth = 1, limit = 10 } = (args || {}) as any;
            const response = await fetch(`${baseUrl}/api/v1/crawl`, {
                method: "POST",
                headers: reqHeaders,
                body: JSON.stringify({ url, depth, limit }),
            });

            if (!response.ok) {
                const errText = await response.text();
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                isError: true,
                                status: response.status,
                                error: `FlyCrawl Crawl Error [${response.status}]: ${errText}`,
                                billed_credits: 0,
                                retryable: response.status >= 500,
                            }, null, 2),
                        },
                    ],
                };
            }

            const resJson: any = await response.json();
            const content = resJson.content || JSON.stringify(resJson, null, 2);
            return {
                content: [
                    {
                        type: "text",
                        text: content,
                    },
                ],
            };
        }

        if (name === "flycrawl_search") {
            const { query, limit = 5 } = (args || {}) as any;
            const response = await fetch(`${baseUrl}/api/v1/search`, {
                method: "POST",
                headers: reqHeaders,
                body: JSON.stringify({ query, limit, scrapeResults: true }),
            });

            if (!response.ok) {
                const errText = await response.text();
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                isError: true,
                                status: response.status,
                                error: `FlyCrawl Search Error [${response.status}]: ${errText}`,
                                billed_credits: 0,
                                retryable: response.status >= 500,
                            }, null, 2),
                        },
                    ],
                };
            }

            const resJson: any = await response.json();
            const results = resJson.results || [];
            const out: string[] = [`# Search Results for: "${query}"\n`];
            for (const r of results) {
                out.push(`## [${r.title || "Result"}](${r.url})\n${r.markdown || r.snippet || ""}\n---\n`);
            }

            return {
                content: [{ type: "text", text: out.join("\n") }],
            };
        }

        if (name === "flycrawl_map") {
            const { url, search, limit = 1000 } = (args || {}) as any;
            const response = await fetch(`${baseUrl}/api/v1/map`, {
                method: "POST",
                headers: reqHeaders,
                body: JSON.stringify({ url, search, limit }),
            });

            if (!response.ok) {
                const errText = await response.text();
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                isError: true,
                                status: response.status,
                                error: `FlyCrawl Map Error [${response.status}]: ${errText}`,
                                billed_credits: 0,
                                retryable: response.status >= 500,
                            }, null, 2),
                        },
                    ],
                };
            }

            const resJson: any = await response.json();
            const links = resJson.links || [];
            return {
                content: [
                    {
                        type: "text",
                        text: `Discovered ${links.length} URLs on ${url}:\n` + links.slice(0, 100).map((l: string) => `- ${l}`).join("\n"),
                    },
                ],
            };
        }

        if (name === "flycrawl_extract") {
            const { url, urls, prompt, schema } = (args || {}) as any;
            const targetUrl = url || (Array.isArray(urls) && urls.length > 0 ? urls[0] : null);

            if (!targetUrl) {
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                isError: true,
                                status: 400,
                                error: "Validation error: 'url' parameter is required.",
                                billed_credits: 0,
                            }, null, 2),
                        },
                    ],
                };
            }

            const response = await fetch(`${baseUrl}/api/v1/extract`, {
                method: "POST",
                headers: reqHeaders,
                body: JSON.stringify({ url: targetUrl, prompt, schema }),
            });

            if (!response.ok) {
                const errText = await response.text();
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                isError: true,
                                status: response.status,
                                error: `FlyCrawl Extract Error [${response.status}]: ${errText}`,
                                billed_credits: 0,
                                retryable: response.status >= 500,
                            }, null, 2),
                        },
                    ],
                };
            }

            const resJson: any = await response.json();
            return {
                content: [{ type: "text", text: JSON.stringify(resJson.data || resJson, null, 2) }],
            };
        }

        return {
            isError: true,
            content: [{ type: "text", text: `Unknown tool requested: ${name}` }],
        };
    } catch (err: any) {
        return {
            isError: true,
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        isError: true,
                        error: `Execution exception: ${err?.message || err}`,
                        billed_credits: 0,
                    }, null, 2),
                },
            ],
        };
    }
});

async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("FlyCrawl MCP server running on stdio.");
}

run().catch((error) => {
    console.error("Fatal error starting FlyCrawl MCP server:", error);
    process.exit(1);
});
