# DigitX (DigitX)

**DigitX** is an ERC‑20/BEP‑20 style token built with **Hardhat** and **OpenZeppelin**.

---

## Features

- **ERC‑20 standard** using OpenZeppelin
- **Fixed total supply** minted once in the constructor
- **Reserve-based distribution** (LP / Exchange / Treasury / Marketing / Team / Development)
- **First‑buy protection (anti‑sniper)**: first transfer from the pool must go to the owner
- **Transfer mode control** (`MODE_NORMAL`, `MODE_TRANSFER_RESTRICTED`, `MODE_TRANSFER_CONTROLLED`)
- Uses OpenZeppelin’s modern **`_update()` hook** for custom transfer logic
- **Hardhat** workflow: compile, test, deploy, verify
- **Multi-network** configuration support

---

## Token Supply

- **Total supply**: `1,000,000,000` tokens
- **Decimals**: `18`
- **Minting**: Only in constructor (no inflation)

---

## Reserve Allocation

All supply is minted in the constructor and allocated to reserve wallets.

| Reserve | Amount | Share | Purpose |
|---|---|---|---|
| LP Reserve | 200,000,000 | 20% | Liquidity pool creation |
| Exchange Reserve | 150,000,000 | 15% | CEX listings / market operations |
| Treasury Reserve | 150,000,000 | 15% | Project treasury |
| Marketing Reserve | 150,000,000 | 15% | Marketing & promotion |
| Team Reserve | 200,000,000 | 20% | Team allocation |
| Development Reserve | 150,000,000 | 15% | Future development |

---

## First‑Buy Protection (Anti‑Sniper)

- `firstBuyCompleted = false` at launch
- After the owner sets the pool address (`pancakeSwapPool`)
- The **first transfer from the pool must go to the owner**, otherwise it reverts with:

`First Buy Pending`

After the first owner buy:
- `firstBuyCompleted = true`
- Event emitted: `FirstBuyDone`
- Public trading proceeds normally

---

## Transfer Modes

- `MODE_NORMAL (0)`: normal transfers
- `MODE_TRANSFER_RESTRICTED (1)`: all transfers revert (`Token: Transfer is restricted`)
- `MODE_TRANSFER_CONTROLLED (2)`: only transfers where `from == owner()` or `to == owner()` are allowed (`Token: Invalid transfer`)

---

## Main Functions

- `setPancakeSwapPool(address pool)` — sets the primary liquidity pool
- `init()` — one-time initialization (sets restricted mode)
- `setMode(uint256 mode)` — updates transfer mode (only when current mode is not NORMAL)
- Standard ERC‑20: `transfer`, `approve`, `transferFrom`, `allowance`, etc. (inherited from OpenZeppelin)

---

## Tech Stack

- Node.js
- Hardhat
- OpenZeppelin Contracts
- dotenv

---

## Project Structure

```
advance-bep20-token/
  contracts/
    DigitX.sol
  scripts/
    deploy.js
    args.js
  test/
    test.js
  hardhat.config.js
  package.json
  .env.example
  .env
```

---

## Install

```bash
npm install
```

---

## Environment Setup

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `PRIVATE_KEY` | Deployer wallet private key |
| `ETH_SEPOLIA_RPC_URL` | Ethereum Sepolia RPC URL |
| `ETH_MAINNET_RPC_URL` | Ethereum mainnet RPC URL |
| `BSC_TESTNET_RPC_URL` | BSC testnet RPC URL |
| `BSC_MAINNET_RPC_URL` | BSC mainnet RPC URL |
| `ETHERSCAN_API_KEY` | Etherscan API key (Ethereum verification) |
| `BSCSCAN_API_KEY` | BscScan API key (BSC verification) |
| `LP_WALLET` | Constructor LP reserve address |
| `EXCHANGE_WALLET` | Constructor exchange reserve address |
| `TREASURY_WALLET` | Constructor treasury reserve address |
| `MARKETING_WALLET` | Constructor marketing reserve address |
| `TEAM_WALLET` | Constructor team reserve address |
| `DEV_WALLET` | Constructor development reserve address |

See [`.env.example`](.env.example) for the full template.

---

## Supported Networks

| Network flag | Chain |
|---|---|
| `sepolia` | Ethereum Sepolia (11155111) |
| `mainnet` | Ethereum mainnet (1) |
| `bscTestnet` | BSC testnet (97) |
| `bsc` | BSC mainnet (56) |

---

## Compile

```bash
npx hardhat compile
```

---

## Test

```bash
npx hardhat test
```

---

## Deploy

Examples:

```bash
# BSC mainnet
npx hardhat run scripts/deploy.js --network bsc

# BSC testnet
npx hardhat run scripts/deploy.js --network bscTestnet

# Ethereum Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

After a successful deploy, the script prints the contract address, deployment tx hash, total supply, and a ready-to-run **verify command**.

---

## Verify

The deploy script outputs the exact verify command. You can also run it manually:

```bash
npx hardhat verify --network bsc DEPLOYED_CONTRACT_ADDRESS --constructor-args scripts/args.js
```

`scripts/args.js` reads the same six reserve wallet addresses from `.env` that were used at deploy time.

For BSC verification, set `BSCSCAN_API_KEY` in `.env` and use the BscScan API key in `hardhat.config.js` when deploying to BNB Chain.

---

## Security Notes

- First‑buy protection reduces launch sniping risk
- Fixed supply prevents inflation
- Constructor reserve wallets must be non-zero addresses

---

## License

MIT
