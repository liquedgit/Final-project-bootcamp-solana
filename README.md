# Reddit D-App

A Simple Reddit Decentralized app build on Solana Chain. Smart contracts are written in anchor and frontend are written using NextJs 14 With help of coral-xyz/anchor library to communicate with solana chain.

## Smart Contract Installation and testing

Install project dependencies using npm

```bash
  cd reddit-app
  npm install
```

Build smart Contract

```bash
  anchor build
```

Test smart Contract

```bash
  anchor test
```

## Frontend Installation

Install project dependencies using npm

```bash
  cd frontend
  npm install
```

Run frontend in development server

```bash
  npm run dev
```

## Demo

- Frontend https://reddit-solana-dapp-frontend.vercel.app/
- Smartcontract https://explorer.solana.com/address/AQKAEEkfkgQJcNUXyCiKFpwDt4fKKB1X2M5dX8hGNeP5?cluster=devnet

PS: Deployed frontend will interact with the smartcontract on devnet. For testing deployed app, make sure to request airdrop on account tab.

## Authors

- [@liquedgit](https://www.github.com/liquedgit)
