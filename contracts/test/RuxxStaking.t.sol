// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {RuxxStaking} from "../src/RuxxStaking.sol";
import {MockERC721} from "./mocks/MockERC721.sol";

contract RuxxStakingTest is Test {
    RuxxStaking staking;
    MockERC721 token;

    address alice = address(0xA1);
    address bob = address(0xB0);

    function setUp() public {
        token = new MockERC721();
        staking = new RuxxStaking(address(token));
        for (uint256 i = 1; i <= 5; i++) token.mint(alice, i);
        token.mint(bob, 100);
        vm.prank(alice);
        token.setApprovalForAll(address(staking), true);
        vm.prank(bob);
        token.setApprovalForAll(address(staking), true);
    }

    function _ids(uint256 a) internal pure returns (uint256[] memory r) {
        r = new uint256[](1);
        r[0] = a;
    }

    function test_stakeEscrowsNft() public {
        vm.prank(alice);
        staking.stake(_ids(1), 7);
        assertEq(token.ownerOf(1), address(staking));
        assertEq(staking.stakedCount(alice), 1);
        assertEq(staking.totalStaked(), 1);
    }

    function test_rejectsBadDuration() public {
        vm.prank(alice);
        vm.expectRevert(RuxxStaking.BadDuration.selector);
        staking.stake(_ids(1), 10);
    }

    function test_accruesPerSecond_500PerDay() public {
        vm.prank(alice);
        staking.stake(_ids(1), 7);
        vm.warp(block.timestamp + 1 days);
        assertEq(staking.pointsOf(alice), 500);
        vm.warp(block.timestamp + 2 days);
        assertEq(staking.pointsOf(alice), 1500);
    }

    function test_scalesPerNft() public {
        uint256[] memory ids = new uint256[](3);
        ids[0] = 1;
        ids[1] = 2;
        ids[2] = 3;
        vm.prank(alice);
        staking.stake(ids, 14);
        vm.warp(block.timestamp + 1 days);
        assertEq(staking.pointsOf(alice), 1500);
    }

    function test_capsAtLockEnd() public {
        vm.prank(alice);
        staking.stake(_ids(1), 7);
        vm.warp(block.timestamp + 30 days);
        assertEq(staking.pointsOf(alice), 7 * 500);
    }

    function test_cannotUnstakeEarly() public {
        vm.prank(alice);
        staking.stake(_ids(1), 7);
        vm.warp(block.timestamp + 6 days);
        vm.prank(alice);
        vm.expectRevert(RuxxStaking.StillLocked.selector);
        staking.unstake(_ids(1));
    }

    function test_unstakeAfterLockBanksPoints() public {
        vm.prank(alice);
        staking.stake(_ids(1), 7);
        vm.warp(block.timestamp + 7 days);
        vm.prank(alice);
        staking.unstake(_ids(1));
        assertEq(token.ownerOf(1), alice);
        assertEq(staking.stakedCount(alice), 0);
        assertEq(staking.bankedPoints(alice), 3500);
        // no further accrual once unstaked
        vm.warp(block.timestamp + 10 days);
        assertEq(staking.pointsOf(alice), 3500);
    }

    function test_onlyStakerCanUnstake() public {
        vm.prank(alice);
        staking.stake(_ids(1), 7);
        vm.warp(block.timestamp + 7 days);
        vm.prank(bob);
        vm.expectRevert(RuxxStaking.NotStaker.selector);
        staking.unstake(_ids(1));
    }

    function test_cannotStakeSomeoneElsesNft() public {
        vm.prank(bob);
        vm.expectRevert();
        staking.stake(_ids(1), 7);
    }

    function test_unstakeMiddleOfListKeepsOthers() public {
        uint256[] memory ids = new uint256[](3);
        ids[0] = 1;
        ids[1] = 2;
        ids[2] = 3;
        vm.prank(alice);
        staking.stake(ids, 7);
        vm.warp(block.timestamp + 7 days);
        vm.prank(alice);
        staking.unstake(_ids(1));
        (uint256[] memory left,,,) = staking.stakedOf(alice);
        assertEq(left.length, 2);
        // the others can still be unstaked
        vm.prank(alice);
        staking.unstake(_ids(2));
        vm.prank(alice);
        staking.unstake(_ids(3));
        assertEq(staking.stakedCount(alice), 0);
        assertEq(staking.bankedPoints(alice), 3 * 3500);
    }

    function test_restakeAfterUnstake() public {
        vm.prank(alice);
        staking.stake(_ids(1), 7);
        vm.warp(block.timestamp + 7 days);
        vm.startPrank(alice);
        staking.unstake(_ids(1));
        staking.stake(_ids(1), 14);
        vm.stopPrank();
        vm.warp(block.timestamp + 14 days);
        assertEq(staking.pointsOf(alice), 3500 + 7000);
    }

    function test_directSafeTransferReverts() public {
        vm.prank(alice);
        vm.expectRevert();
        token.safeTransferFrom(alice, address(staking), 1);
    }
}
