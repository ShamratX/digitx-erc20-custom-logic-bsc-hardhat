# Voltex (VLX)

**Voltex** is an ERC‑20/BEP‑20 style token built with **Hardhat** and **OpenZeppelin**.

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

| Reserve | Purpose |
|---|---|
| LP Reserve | Liquidity pool creation |
| Exchange Reserve | CEX listings / market operations |
| Treasury Reserve | Project treasury |
| Marketing Reserve | Marketing & promotion |
| Team Reserve | Team allocation |
| Development Reserve | Future development |

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
- `increaseAllowance(...)` / `decreaseAllowance(...)` — safe allowance helpers

---

## Tech Stack

- Node.js
- Hardhat
- OpenZeppelin Contracts
- dotenv

---

## Project Structure

```
Dex-Token/
  contracts/
    Voltex.sol
  scripts/
    deploy.js
  test/
    Voltex.test.js
  hardhat.config.js
  package.json
  .env
```

---

## Install

```bash
npm install
```

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

Example:

```bash
npx hardhat run scripts/deploy.js --network bscMainnet
```

---

## Environment Variables (`.env`)

Example:

```env
PRIVATE_KEY=your_private_key

# RPC URLs
SEPOLIA_RPC_URL=...
ETH_MAINNET_RPC_URL=...
BSC_TESTNET_RPC_URL=...
BSC_MAINNET_RPC_URL=...

# Explorer keys
ETHERSCAN_API_KEY=...
BSCSCAN_API_KEY=...

# Constructor wallets for Voltex.sol
LP_WALLET=0x...
EXCHANGE_WALLET=0x...
TREASURY_WALLET=0x...
MARKETING_WALLET=0x...
TEAM_WALLET=0x...
DEV_WALLET=0x...
```

---

## Verify

Example:

```bash
npx hardhat verify --network bscMainnet DEPLOYED_CONTRACT_ADDRESS
```

(If your constructor has parameters, you must pass the same constructor arguments used at deploy time.)

---

## Security Notes

- First‑buy protection reduces launch sniping risk
- Fixed supply prevents inflation

---

## License

MIT`