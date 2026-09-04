#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const apiKey = process.env.FLYCRAWL_API_KEY;
const baseUrl = (process.env.FLYCRAWL_BASE_URL || "https://flycrawl.net").replace(/\/$/, "");

if (!apiKey) {
  console.error("Warning: FLYCRAWL_API_KEY environment variable is not set. Requests will fail if authentication is required.");
}

const server = new Server(
  {
    name: "flycrawl-mcp-server",
    version: "1.0.0",
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
        description: "Scrapes any webpage into clean, LLM-optimized markdown or HTML. Handles JavaScript, anti-bot challenges (Cloudflare), and extracts main content.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The complete URL of the webpage to scrape.",
            },
            onlyMainContent: {
              type: "boolean",
              description: "Whether to strip navigation, headers, footers, and ads (default: true).",
              default: true,
            },
          },
          required: ["url"],
        },
      },
      {
        name: "flycrawl_search",
        description: "Searches the live web and retrieves extracted markdown content from the top results.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query to execute on the web.",
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
        name: "flycrawl_map",
        description: "Explores and returns all reachable URLs within a website domain under 2 seconds.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The target website domain to map.",
            },
            search: {
              type: "string",
              description: "Optional keyword to filter discovered URLs.",
            },
          },
          required: ["url"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "flycrawl_scrape") {
      const { url, onlyMainContent = true } = args as { url: string; onlyMainContent?: boolean };
      const response = await fetch(`${baseUrl}/api/v1/scrape`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "FlyCrawl-MCP/1.0.0",
        },
        body: JSON.stringify({
          url,
          formats: ["markdown"],
          onlyMainContent,
        }),
      });

      if (!response.ok) {
        return {
          isError: true,
          content: [{ type: "text", text: `FlyCrawl API error [${response.status}]: ${await response.text()}` }],
        };
      }

      const resJson: any = await response.json();
      const markdown = resJson.data?.markdown || resJson.markdown || "No markdown content extracted.";
      const title = resJson.data?.metadata?.title || resJson.metadata?.title || url;

      return {
        content: [
          {
            type: "text",
            text: `# ${title}\n\n${markdown}`,
          },
        ],
      };
    }

    if (name === "flycrawl_search") {
      const { query, limit = 5 } = args as { query: string; limit?: number };
      const response = await fetch(`${baseUrl}/api/v1/search`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "FlyCrawl-MCP/1.0.0",
        },
        body: JSON.stringify({ query, limit }),
      });

      if (!response.ok) {
        return {
          isError: true,
          content: [{ type: "text", text: `Search API error: ${await response.text()}` }],
        };
      }

      const resJson: any = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(resJson, null, 2) }],
      };
    }

    if (name === "flycrawl_map") {
      const { url, search } = args as { url: string; search?: string };
      const response = await fetch(`${baseUrl}/api/v1/map`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "FlyCrawl-MCP/1.0.0",
        },
        body: JSON.stringify({ url, search, limit: 5000 }),
      });

      if (!response.ok) {
        return {
          isError: true,
          content: [{ type: "text", text: `Map API error: ${await response.text()}` }],
        };
      }

      const resJson: any = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(resJson, null, 2) }],
      };
    }

    return {
      isError: true,
      content: [{ type: "text", text: `Unknown tool requested: ${name}` }],
    };
  } catch (err: any) {
    return {
      isError: true,
      content: [{ type: "text", text: `Execution exception: ${err.message}` }],
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
