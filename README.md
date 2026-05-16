# dns-mcp

[![npm](https://img.shields.io/npm/v/@mukundakatta/dns-mcp.svg)](https://www.npmjs.com/package/@mukundakatta/dns-mcp)
[![mcp](https://img.shields.io/badge/protocol-MCP-blue.svg)](https://modelcontextprotocol.io)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

MCP server: resolve DNS records for a hostname. No external deps — uses
Node's built-in `dns/promises` resolver, which respects the host's
nameserver configuration.

## Tool

### `resolve`

```json
{ "hostname": "example.com", "type": "MX" }
```

→

```json
{
  "hostname": "example.com",
  "type": "MX",
  "records": [{ "priority": 0, "exchange": "." }]
}
```

Supported types: `A`, `AAAA`, `MX`, `TXT`, `CNAME`, `NS`, `SOA`, `SRV`,
`PTR`, `ANY`. Default is `A`.

## Configure

```json
{ "mcpServers": { "dns": { "command": "npx", "args": ["-y", "@mukundakatta/dns-mcp"] } } }
```

## License

MIT.
