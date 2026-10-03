# Ruxxells Raffle contract

A Foundry project, kept separate from the frontend (`/contracts`, doesn't touch
anything in `/src`). Implements the delayed-distribution raffle: NFTs
deposited by the team, wallets enter during a fixed window, every entrant is
guaranteed one NFT, admin distributes after the window closes, leftovers get
swept to the team vault.

No external dependencies (no OpenZeppelin) -- `src/RuxxellsRaffle.sol` is a
single self-contained file, so it also pastes directly into Remix if you'd
rather deploy that way.

## Setup (first time)

```bash
cd contracts
forge install foundry-rs/forge-std --no-commit
```

## Build & test

```bash
forge build
forge test -vvv
```

I wrote `test/RuxxellsRaffle.t.sol` covering the full flow (deposit → open →
enter → distribute in batches → sweep), one-entry-per-wallet, the raffle
filling up once entries match supply, and every admin function rejecting a
non-owner caller -- but I haven't been able to run `forge build`/`forge test`
myself in this sandbox (the Foundry installer's download host isn't reachable
from here). Run it locally before you trust it, and send me the output if
anything fails to fix.

## How it works

1. **Deposit**: the Safe calls `safeTransferFrom` on the Ruxxells NFT
   contract, sending each raffle token to this contract's address. The
   contract's `onERC721Received` hook records every tokenId it receives.
2. **Open entries**: owner (should be the Safe) calls
   `openEntries(1800)` for a 30-minute window (`1800` seconds). Can only be
   called once, and only after at least one NFT has been deposited.
3. **Enter**: any wallet calls `enter()` while the window is open. One entry
   per wallet. Once entries reach the number of deposited NFTs, further
   entries revert (`RaffleFull`) -- there's no point entering once every slot
   is taken.
4. **Distribute**: once `block.timestamp >= entryDeadline`, owner calls
   `distribute(count)` -- sends the next `count` entrants their NFT, in the
   order they entered. Call it again (any count) to keep going; it's safe to
   call repeatedly until `remainingToDistribute()` returns 0. Batching this
   way means it never risks running out of gas even with a lot of entrants.
5. **Sweep**: once every entrant has been paid, owner calls
   `sweepUnclaimed()` once -- sends any deposited NFTs beyond what entrants
   used to the team vault (hardcoded in the contract as `TEAM_VAULT`).

## Deploying

The Safe can't sign a raw deploy transaction, so deploy from a normal wallet
and set `INITIAL_OWNER` to the Safe address directly -- that way the Safe is
the contract's owner from the moment it's deployed, no extra
`transferOwnership` step needed.

```bash
export PRIVATE_KEY=0x...            # a normal throwaway/deployer EOA, NOT the Safe
export NFT_CONTRACT=0x...           # the Ruxxells collection
export INITIAL_OWNER=0x...          # your Safe address
export ROBINHOOD_RPC_URL=https://robinhood-mainnet.g.alchemy.com/v2/<your-key>

forge script script/Deploy.s.sol:Deploy --rpc-url robinhood --broadcast
```

After deploy, every admin call (`openEntries`, `distribute`, `sweepUnclaimed`)
has to come from the Safe (propose → sign → execute in the Safe UI, same as
any other Safe transaction), since the Safe is `owner`.

## Using Remix instead

Paste `src/RuxxellsRaffle.sol` into a new Remix file as-is (no imports to
resolve), compile with `0.8.24`, deploy with constructor args
`(nftContract, initialOwner)`. Same caveat: set `initialOwner` to the Safe
address directly if you want the Safe to hold admin rights from deployment.
