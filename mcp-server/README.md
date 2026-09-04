# 🤖 FlyCrawl Model Context Protocol (MCP) Server

Official [Model Context Protocol](https://modelcontextprotocol.io/) server for FlyCrawl. Enables Claude Desktop, Cursor AI, Windsurf, and any MCP-compatible agent to scrape, crawl, and search the live web directly without token bloat.

## 🚀 Setup

### Claude Desktop

Add this block to your `claude_desktop_config.json`:

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

### Cursor IDE

In Cursor Settings -> Features -> MCP Servers:
- **Type**: `command`
- **Command**: `npx -y @flycrawl/mcp-server`
- **Environment Variables**: `FLYCRAWL_API_KEY=fc_live_YOUR_API_KEY`

## 🛠️ Available MCP Tools

| Tool | Description |
| :--- | :--- |
| `flycrawl_scrape` | Scrapes any URL and converts it into clean, noise-free Fit-Markdown. |
| `flycrawl_extract` | Extracts typed JSON data matching a natural language prompt or schema. |
| `flycrawl_search` | Searches the live web and extracts clean summaries from top results. |
| `flycrawl_map` | Fast discovery of all internal URLs within a domain. |

## 📄 License
MIT License.
