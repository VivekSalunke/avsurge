// Forces Node's built-in fetch (undici-based) to use IPv4-only connections.
// Fixes a known WSL2 issue where dual-stack IPv6 connection attempts hang
// and cause ETIMEDOUT, even though IPv4 alone connects instantly.
import { Agent, setGlobalDispatcher } from 'undici'

setGlobalDispatcher(new Agent({ connect: { family: 4 } }))
