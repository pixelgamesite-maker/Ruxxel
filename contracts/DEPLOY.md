# Deploying & running the Ruxxells raffle

Everything here runs on **your** machine or Codespace — not in the Claude
sandbox — because it uses your real deployer key. The key is imported once
into Foundry's encrypted keystore and never written to a file or pasted
anywhere.

## 1. Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
# restart your shell, or: source ~/.bashrc
foundryup
forge --version   # confirm it's installed
```

(In a GitHub Codespace this works out of the box — the download host isn't
blocked there the way it is in the Claude sandbox.)

## 2. Install dependencies & test

```bash
cd contracts
forge install foundry-rs/forge-std --no-commit
forge test -vvv
```

All tests should pass. The contract already compiles clean on solc 0.8.24;
this is the first run against the real Foundry EVM.

## 3. Import your deployer key (once)

This is the "import the private key" step — done the safe way. You paste the
key once, interactively; Foundry encrypts it with a password and stores it
under a name. Nothing lands in the repo or your shell history.

```bash
cast wallet import ruxxell-deployer --interactive
# paste the deployer EOA's private key when prompted, choose a password
```

From here on you refer to it as `--account ruxxell-deployer` and type the
password when Foundry asks. The deployer EOA is now both the deployer and the
owner/vault-controller — no Safe in the loop.

> ⚠️ For the **test** collection this single-EOA setup is fine. For the real
> mainnet drop, remember a plain EOA has no multisig protection — whoever holds
> that key has full control of the raffle and its NFTs. Worth reconsidering a
> Safe as `INITIAL_OWNER` before the real drop.

## 4. Deploy

```bash
export NFT_CONTRACT=0xb2968ed4c7e7a35B9A07acEE1eA96F3A6d5682dF   # test collection
export INITIAL_OWNER=<your-deployer-address>                    # same EOA is fine
export ROBINHOOD_RPC_URL=https://robinhood-mainnet.g.alchemy.com/v2/<your-key>

forge script script/Deploy.s.sol:Deploy \
  --rpc-url "$ROBINHOOD_RPC_URL" \
  --account ruxxell-deployer \
  --sender <your-deployer-address> \
  --broadcast

# note the "RuxxellsRaffle deployed at: 0x..." line — that's RAFFLE below
```

## 5. Deposit the prize NFTs

The deployer EOA holds the NFTs. One approval covers the whole collection,
then one deposit call pulls them all in.

```bash
export RAFFLE=0x...   # from the deploy output

# a) approve the raffle to move your NFTs (once per collection)
cast send "$NFT_CONTRACT" "setApprovalForAll(address,bool)" "$RAFFLE" true \
  --rpc-url "$ROBINHOOD_RPC_URL" --account ruxxell-deployer --sender <addr>

# b) deposit the token IDs you're raffling, e.g. 1..10
cast send "$RAFFLE" "depositPrizes(uint256[])" "[1,2,3,4,5,6,7,8,9,10]" \
  --rpc-url "$ROBINHOOD_RPC_URL" --account ruxxell-deployer --sender <addr>
```

> If you'd rather keep a Safe and batch-send from it instead, the contract
> also accepts NFTs sent in via `safeTransferFrom` (its `onERC721Received`
> hook records them) — use the existing `batch-transfer` tool pointed at the
> raffle address. Either path works; `depositPrizes` is just the one-tx way
> from an EOA.

## 6. Open the 30-minute entry window

```bash
cast send "$RAFFLE" "openEntries(uint256)" 1800 \
  --rpc-url "$ROBINHOOD_RPC_URL" --account ruxxell-deployer --sender <addr>
# 1800 seconds = 30 minutes. Entries accepted until it elapses.
```

Entrants now connect on the `/claim` page and call `enter()` themselves (gas
only, no fee). Entries are capped at the number of NFTs you deposited, so
everyone who gets in is guaranteed one.

## 7. Distribute after the window closes

Once the 30 minutes are up, send everyone their NFT. Batched so it can't run
out of gas; call again until nothing's left.

```bash
cast send "$RAFFLE" "distribute(uint256)" 50 \
  --rpc-url "$ROBINHOOD_RPC_URL" --account ruxxell-deployer --sender <addr>
# repeat until remainingToDistribute() returns 0:
cast call "$RAFFLE" "remainingToDistribute()(uint256)" --rpc-url "$ROBINHOOD_RPC_URL"
```

## 8. Sweep leftovers to the vault

If fewer people entered than there were NFTs, send the unused ones to the team
vault (`0xCedBE9a8b29d4E80f04eb6718B2510fc66F7EFE2`, hardcoded in the contract).

```bash
cast send "$RAFFLE" "sweepUnclaimed()" \
  --rpc-url "$ROBINHOOD_RPC_URL" --account ruxxell-deployer --sender <addr>
```

Done.
