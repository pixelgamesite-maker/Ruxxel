// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {RuxxStaking} from "../src/RuxxStaking.sol";

/**
 * Deploys RuxxStaking (same keystore flow as Deploy.s.sol).
 *
 *   export NFT_CONTRACT=0xec58af19a910f73f3ea50de685967cf93ea00b54
 *   forge script script/DeployStaking.s.sol:DeployStaking \
 *     --rpc-url "$ROBINHOOD_RPC_URL" \
 *     --account ruxxell-deployer --sender <deployer-address> --broadcast
 *
 * No owner argument: the contract has no admin.
 */
contract DeployStaking is Script {
    function run() external returns (RuxxStaking staking) {
        address nftContract = vm.envAddress("NFT_CONTRACT");
        vm.startBroadcast();
        staking = new RuxxStaking(nftContract);
        vm.stopBroadcast();
        console.log("RuxxStaking deployed at:", address(staking));
    }
}
