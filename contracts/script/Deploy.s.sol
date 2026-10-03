// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {RuxxellsRaffle} from "../src/RuxxellsRaffle.sol";

/**
 * Deploys RuxxellsRaffle.
 *
 * Signing is done with an ENCRYPTED KEYSTORE, not a raw private key in the
 * environment -- the key never appears in a file, in shell history, or in
 * this repo. You import it once (interactively) and refer to it by name:
 *
 *   cast wallet import ruxxell-deployer --interactive
 *     # paste the deployer key when prompted, set a password
 *
 * Then deploy, passing the account name and its address. Foundry prompts for
 * the keystore password at broadcast time:
 *
 *   export NFT_CONTRACT=0x...     # the Ruxxells collection
 *   export INITIAL_OWNER=0x...    # who controls the raffle (the deployer EOA
 *                                 # itself is fine now the Safe is dropped)
 *   export ROBINHOOD_RPC_URL=https://robinhood-mainnet.g.alchemy.com/v2/<key>
 *
 *   forge script script/Deploy.s.sol:Deploy \
 *     --rpc-url "$ROBINHOOD_RPC_URL" \
 *     --account ruxxell-deployer \
 *     --sender <deployer-address> \
 *     --broadcast
 *
 * `vm.startBroadcast()` takes no key here -- it uses the --account/--sender
 * pair from the CLI, which is the whole point of the keystore flow.
 */
contract Deploy is Script {
    function run() external returns (RuxxellsRaffle raffle) {
        address nftContract = vm.envAddress("NFT_CONTRACT");
        address initialOwner = vm.envAddress("INITIAL_OWNER");

        vm.startBroadcast();
        raffle = new RuxxellsRaffle(nftContract, initialOwner);
        vm.stopBroadcast();

        console.log("RuxxellsRaffle deployed at:", address(raffle));
        console.log("Owner set to:", initialOwner);
    }
}
