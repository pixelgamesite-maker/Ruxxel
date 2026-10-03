// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {RuxxellsRaffle} from "../src/RuxxellsRaffle.sol";
import {MockERC721} from "./mocks/MockERC721.sol";

contract RuxxellsRaffleTest is Test {
    RuxxellsRaffle raffle;
    MockERC721 token;

    address owner = address(0xA11CE);
    address vault = 0xCedBE9a8b29d4E80f04eb6718B2510fc66F7EFE2; // must match TEAM_VAULT in the contract

    address alice = address(0x1);
    address bob = address(0x2);
    address carol = address(0x3);
    address dave = address(0x4);

    function setUp() public {
        token = new MockERC721();
        raffle = new RuxxellsRaffle(address(token), owner);
    }

    function _deposit(uint256 tokenId) internal {
        token.mint(owner, tokenId);
        vm.prank(owner);
        token.safeTransferFrom(owner, address(raffle), tokenId);
    }

    function test_depositTracksTokens() public {
        _deposit(1);
        _deposit(2);
        assertEq(raffle.depositedCount(), 2);
    }

    function test_cannotDepositWrongCollection() public {
        MockERC721 other = new MockERC721();
        other.mint(owner, 1);
        vm.prank(owner);
        vm.expectRevert(RuxxellsRaffle.WrongCollection.selector);
        other.safeTransferFrom(owner, address(raffle), 1);
    }

    function test_openEntriesRequiresDeposits() public {
        vm.prank(owner);
        vm.expectRevert(RuxxellsRaffle.NoDeposits.selector);
        raffle.openEntries(30 minutes);
    }

    function test_fullFlow_everyEntrantGetsOneNft() public {
        _deposit(1);
        _deposit(2);
        _deposit(3);

        vm.prank(owner);
        raffle.openEntries(30 minutes);
        assertTrue(raffle.isOpen());

        vm.prank(alice);
        raffle.enter();
        vm.prank(bob);
        raffle.enter();

        assertEq(raffle.entrantsCount(), 2);
        assertTrue(raffle.hasEntered(alice));

        // can't distribute while still open
        vm.prank(owner);
        vm.expectRevert(RuxxellsRaffle.EntriesStillOpen.selector);
        raffle.distribute(10);

        vm.warp(block.timestamp + 31 minutes);
        assertFalse(raffle.isOpen());

        // entries closed now
        vm.prank(carol);
        vm.expectRevert(RuxxellsRaffle.EntriesNotOpen.selector);
        raffle.enter();

        // distribute in batches of 1 to prove it's resumable
        vm.prank(owner);
        raffle.distribute(1);
        assertEq(token.ownerOf(1), alice);
        assertEq(raffle.remainingToDistribute(), 1);

        vm.prank(owner);
        raffle.distribute(10); // more than remaining, should just finish
        assertEq(token.ownerOf(2), bob);
        assertEq(raffle.remainingToDistribute(), 0);

        // token 3 was never entered for -- sweep it to the vault
        vm.prank(owner);
        raffle.sweepUnclaimed();
        assertEq(token.ownerOf(3), vault);
    }

    function test_oneEntryPerWallet() public {
        _deposit(1);
        _deposit(2);
        vm.prank(owner);
        raffle.openEntries(30 minutes);

        vm.prank(alice);
        raffle.enter();

        vm.prank(alice);
        vm.expectRevert(RuxxellsRaffle.AlreadyEntered.selector);
        raffle.enter();
    }

    function test_raffleFullOnceEntriesMatchSupply() public {
        _deposit(1);
        vm.prank(owner);
        raffle.openEntries(30 minutes);

        vm.prank(alice);
        raffle.enter();

        vm.prank(bob);
        vm.expectRevert(RuxxellsRaffle.RaffleFull.selector);
        raffle.enter();
    }

    function test_sweepRequiresFullDistribution() public {
        _deposit(1);
        _deposit(2);
        vm.prank(owner);
        raffle.openEntries(30 minutes);

        vm.prank(alice);
        raffle.enter();

        vm.warp(block.timestamp + 31 minutes);

        vm.prank(owner);
        vm.expectRevert(RuxxellsRaffle.NotFullyDistributed.selector);
        raffle.sweepUnclaimed();
    }

    function test_cannotSweepTwice() public {
        _deposit(1);
        vm.prank(owner);
        raffle.openEntries(30 minutes);

        vm.prank(alice);
        raffle.enter();

        vm.warp(block.timestamp + 31 minutes);

        vm.prank(owner);
        raffle.distribute(10);

        vm.prank(owner);
        raffle.sweepUnclaimed(); // nothing left, but should succeed and flip `swept`

        vm.prank(owner);
        vm.expectRevert(RuxxellsRaffle.AlreadySwept.selector);
        raffle.sweepUnclaimed();
    }

    function test_onlyOwnerCanAdmin() public {
        _deposit(1);

        vm.prank(alice);
        vm.expectRevert(RuxxellsRaffle.NotOwner.selector);
        raffle.openEntries(30 minutes);

        vm.prank(owner);
        raffle.openEntries(30 minutes);

        vm.warp(block.timestamp + 31 minutes);

        vm.prank(alice);
        vm.expectRevert(RuxxellsRaffle.NotOwner.selector);
        raffle.distribute(1);
    }

    function test_noNewEntriesAfterOpenedEvenIfMoreDeposited() public {
        _deposit(1);
        vm.prank(owner);
        raffle.openEntries(30 minutes);

        // depositing more after entries opened should revert
        token.mint(owner, 2);
        vm.prank(owner);
        vm.expectRevert(RuxxellsRaffle.AlreadyOpened.selector);
        token.safeTransferFrom(owner, address(raffle), 2);
    }
}
