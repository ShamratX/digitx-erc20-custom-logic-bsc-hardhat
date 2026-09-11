# DigitX (Hardhat ERC-20)

Custom ERC-20 / BEP-20 style token built with **Hardhat** and **OpenZeppelin**. Fixed supply with reserve wallets, transfer modes, and first-buy (anti-sniper) protection.

## Features

- OpenZeppelin ERC-20 + Ownable
- Fixed supply **1,000,000,000** (18 decimals), minted once to reserve wallets
- Transfer modes: `NORMAL`, `TRANSFER_RESTRICTED`, `TRANSFER_CONTROLLED`
- First-buy rule: first transfer from the configured pool must go to the owner
- Multi-network Hardhat config: Ethereum + BSC (mainnet/testnet)

## How it works

Constructor mints the full supply across LP / Exchange / Treasury / Marketing / Team / Development wallets from env. Owner calls `init()` → restricted mode, configures pool, then progresses modes. Once mode is `NORMAL`, it cannot be changed again.

## Requirements

- Node.js 18+
- npm
- `.env` with deployer key, RPCs, and six reserve wallet addresses

## Quick start

```bash
git clone https://github.com/ShamratX/digitx-erc20-custom-logic-bsc-hardhat.git
cd digitx-erc20-custom-logic-bsc-hardhat
npm install
cp .env.example .env
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network bscTestnet
```

Networks: `hardhat`, `sepolia`, `eth`, `bscTestnet`, `bsc`.

## Config (env names)

`PRIVATE_KEY`, `ETH_SEPOLIA_RPC_URL`, `ETH_MAINNET_RPC_URL`, `BSC_TESTNET_RPC_URL`, `BSC_MAINNET_RPC_URL`, `ETHERSCAN_API_KEY`, `BSCSCAN_API_KEY`, `LP_WALLET`, `EXCHANGE_WALLET`, `TREASURY_WALLET`, `MARKETING_WALLET`, `TEAM_WALLET`, `DEV_WALLET`

## Project structure

```text
contracts/DigitX.sol
scripts/deploy.js
scripts/args.js
test/test.js
hardhat.config.js
```

## Limitations

- No buy/sell tax in this contract.
- Owner receives 0 at mint (reserves only).
- Explorer verify on BSC may need Hardhat apiKey pointed at `BSCSCAN_API_KEY`.
- Prefer `--network eth` for Ethereum mainnet (not a `mainnet` key in config).

## License

See repository / package metadata.
