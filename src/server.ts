#!/usr/bin/env node
/**
 * dns MCP server. One tool: `resolve`.
 *
 * Look up DNS records for a hostname. Supports A, AAAA, MX, TXT, CNAME, NS,
 * SOA, SRV, PTR. Pure Node — uses the built-in `dns/promises` resolver.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dns from 'node:dns/promises';

const VERSION = '0.1.0';

export type RecordType = 'A' | 'AAAA' | 'MX' | 'TXT' | 'CNAME' | 'NS' | 'SOA' | 'SRV' | 'PTR' | 'ANY';

const SUPPORTED: RecordType[] = ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS', 'SOA', 'SRV', 'PTR', 'ANY'];

export async function resolve(hostname: string, type: RecordType = 'A'): Promise<unknown> {
  if (!SUPPORTED.includes(type)) throw new Error('unsupported record type: ' + type);
  switch (type) {
    case 'A':
      return await dns.resolve4(hostname);
    case 'AAAA':
      return await dns.resolve6(hostname);
    case 'MX':
      return await dns.resolveMx(hostname);
    case 'TXT':
      return await dns.resolveTxt(hostname);
    case 'CNAME':
      return await dns.resolveCname(hostname);
    case 'NS':
      return await dns.resolveNs(hostname);
    case 'SOA':
      return await dns.resolveSoa(hostname);
    case 'SRV':
      return await dns.resolveSrv(hostname);
    case 'PTR':
      return await dns.resolvePtr(hostname);
    case 'ANY':
      return await dns.resolveAny(hostname);
  }
  throw new Error('unreachable');
}

const server = new Server({ name: 'dns', version: VERSION }, { capabilities: { tools: {} } });

const TOOLS = [
  {
    name: 'resolve',
    description:
      'Resolve DNS records for a hostname. type: A, AAAA, MX, TXT, CNAME, NS, SOA, SRV, PTR, or ANY.',
    inputSchema: {
      type: 'object',
      properties: {
        hostname: { type: 'string' },
        type: {
          type: 'string',
          enum: SUPPORTED,
          default: 'A',
        },
      },
      required: ['hostname'],
    },
  },
] as const;

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;
  try {
    if (name !== 'resolve') return errorResult('unknown tool: ' + name);
    const a = args as unknown as { hostname: string; type?: RecordType };
    const records = await resolve(a.hostname, a.type ?? 'A');
    return jsonResult({ hostname: a.hostname, type: a.type ?? 'A', records });
  } catch (err) {
    return errorResult('dns resolve failed: ' + (err as Error).message);
  }
});

function jsonResult(value: unknown) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}
function errorResult(message: string) {
  return { isError: true, content: [{ type: 'text', text: message }] };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write(`dns MCP server v${VERSION} ready on stdio\n`);
}
