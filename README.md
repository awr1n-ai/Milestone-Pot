# Milestone-Pot

A simple group gift pot. A creator opens a pot for a recipient with an unlock date, friends contribute funds, and the recipient can claim the funds only after the unlock date — enforced on-chain on **Monad Testnet**.

**Live app:** https://milestone-pot.pages.dev

## Stack

- **Frontend**: Vite + React + TypeScript (`web/`)
- **Chain client**: [viem](https://viem.sh)
- **Contracts**: Solidity 0.8.31 + Hardhat 3 (`contracts/`), deployed with Hardhat Ignition
- **Network**: Monad Testnet (chain id `10143`)

## Project layout

```
contracts/            Hardhat 3 project
  contracts/           Solidity source (empty for now)
  ignition/modules/    Hardhat Ignition deployment modules (empty for now)
  test/                Contract tests (empty for now)
  hardhat.config.ts
  .env.example

web/                  Vite + React + TypeScript frontend
  src/
  .env.example
```

## Prerequisites

- Node.js 22+ and npm
- A funded Monad Testnet account (private key) for deploying contracts — get testnet MON from the official faucet

## Setup

### 1. Contracts (`contracts/`)

```bash
cd contracts
npm install
cp .env.example .env
# edit .env and set PRIVATE_KEY to your Monad Testnet deployer private key
npx hardhat compile
```

Deploy to Monad Testnet (once a contract + Ignition module exist):

```bash
npm run deploy:testnet
```

### 2. Frontend (`web/`)

```bash
cd web
npm install
cp .env.example .env
# edit .env and set VITE_MILESTONE_POT_CONTRACT_ADDRESS after deployment
npm run dev
```

## Deployment

The frontend is a static Vite build, deployed to **Cloudflare Pages** via Wrangler (direct upload, not Git-connected):

```bash
cd web
npm run deploy
```

This runs `npm run build` and then `wrangler pages deploy` against the `milestone-pot` Cloudflare Pages project. Requires a local Cloudflare login (`npx wrangler login`) and a correctly configured `web/.env` (see `.env.example`) — the `VITE_*` values are inlined into the build at build time.

Live at: **https://milestone-pot.pages.dev**

## Network reference

| | |
|---|---|
| Chain ID | `10143` |
| RPC URL | `https://testnet-rpc.monad.xyz` |
| Explorer | `https://testnet.monadscan.com` |
| Native currency | MON |

Source: [docs.monad.xyz](https://docs.monad.xyz)

## Status

Deployed and working on Monad Testnet: contract live, frontend live on Cloudflare Pages, full create → contribute → claim flow functional.
