// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {RuxxellsRaffle} from "../src/RuxxellsRaffle.sol";

/**
 * Deploys RuxxellsRaffle.
 *
 * Required env vars:
 *   PRIVATE_KEY   - deployer key (local/test wallet; NOT the Safe -- a Safe
 *                   can't sign a raw tx, so deploy from a normal EOA, then
 *                   call transferOwnership(SAFE_ADDRESS) separately, either
 *                   as its own script run or directly from the Safe UI).
 *   NFT_CONTRACT  - the Ruxxells collection address.
 *   INITIAL_OWNER - who the contract's `owner` should be. Usually your Safe
 *                   address directly, so you skip the extra transferOwnership
 *                   step -- the Safe just can't be msg.sender at deploy time.
 *
 * Usage:
 *   forge script script/Deploy.s.sol:Deploy \
 *     --rpc-url robinhood \
 *     --broadcast \
 *     --verify
 */
contract Deploy is Script {
    function run() external returns (RuxxellsRaffle raffle) {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address nftContract = vm.envAddress("NFT_CONTRACT");
        address initialOwner = vm.envAddress("INITIAL_OWNER");

        vm.startBroadcast(pk);
        raffle = new RuxxellsRaffle(nftContract, initialOwner);
        vm.stopBroadcast();

        console.log("RuxxellsRaffle deployed at:", address(raffle));
        console.log("Owner set to:", initialOwner);
    }
}
