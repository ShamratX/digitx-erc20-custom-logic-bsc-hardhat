# PROJECT_BRAIN — digitx-erc20-custom-logic-bsc-hardhat

## Purpose

Hardhat project for `DigitX` token with launch controls (modes + first-buy) without transfer tax.

## Architecture

- Contract: `DigitX.sol` (OZ ERC20 + Ownable, Solidity 0.8.28)
- Deploy: `scripts/deploy.js` + verify args `scripts/args.js`
- Tests cover deploy, modes, pool, first-buy
- package.json name may read `advance-bep20-token`; npm `test` script may be a stub — use `npx hardhat test`

## Workflow

1. Fill reserve wallets + keys in `.env`
2. Compile / test / deploy to chosen network
3. Owner: `init`, `setPancakeSwapPool`, operate modes until NORMAL

## Gotchas

- After NORMAL, mode is locked.
- First buy from pool must be to owner before general trading flow intended by design.
- No tax logic — contrast with Veltrix repo.
