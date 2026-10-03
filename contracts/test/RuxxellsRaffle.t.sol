// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {RuxxellsRaffle, OwnableMinimal} from "../src/RuxxellsRaffle.sol";
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

    /* ---- merkle allowlist helpers (2-leaf tree {a,b}) ------------------- */

    function _leaf(address a) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(a));
    }

    /// Root of a 2-leaf tree over {a, b}, sorted-pair hashed.
    function _root2(address a, address b) internal pure returns (bytes32) {
        bytes32 la = _leaf(a);
        bytes32 lb = _leaf(b);
        return la <= lb ? keccak256(abi.encodePacked(la, lb)) : keccak256(abi.encodePacked(lb, la));
    }

    /// Proof for one leaf of a 2-leaf tree — just the other leaf.
    function _proof1(address other) internal pure returns (bytes32[] memory p) {
        p = new bytes32[](1);
        p[0] = _leaf(other);
    }

    /// Set the allowlist to the 2-leaf tree {a, b}.
    function _setAllowlist2(address a, address b) internal {
        vm.prank(owner);
        raffle.setMerkleRoot(_root2(a, b));
    }

    function test_depositTracksTokens() public {
        _deposit(1);
        _deposit(2);
        assertEq(raffle.depositedCount(), 2);
    }

    function test_depositPrizes_pullPattern() public {
        // The approve-then-deposit path: owner mints, approves the raffle for
        // the whole collection, then deposits several tokens in one call.
        token.mint(owner, 10);
        token.mint(owner, 11);
        token.mint(owner, 12);

        vm.startPrank(owner);
        token.setApprovalForAll(address(raffle), true);
        uint256[] memory ids = new uint256[](3);
        ids[0] = 10;
        ids[1] = 11;
        ids[2] = 12;
        raffle.depositPrizes(ids);
        vm.stopPrank();

        assertEq(raffle.depositedCount(), 3);
        assertEq(token.ownerOf(10), address(raffle));
        assertEq(token.ownerOf(12), address(raffle));
    }

    function test_depositPrizes_onlyOwner() public {
        token.mint(alice, 10);
        vm.startPrank(alice);
        token.setApprovalForAll(address(raffle), true);
        uint256[] memory ids = new uint256[](1);
        ids[0] = 10;
        vm.expectRevert(OwnableMinimal.NotOwner.selector);
        raffle.depositPrizes(ids);
        vm.stopPrank();
    }

    function test_depositPrizes_revertsAfterOpened() public {
        _deposit(1);
        vm.prank(owner);
        raffle.openEntries(30 minutes);

        token.mint(owner, 10);
        vm.startPrank(owner);
        token.setApprovalForAll(address(raffle), true);
        uint256[] memory ids = new uint256[](1);
        ids[0] = 10;
        vm.expectRevert(RuxxellsRaffle.AlreadyOpened.selector);
        raffle.depositPrizes(ids);
        vm.stopPrank();
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

        _setAllowlist2(alice, bob);

        vm.prank(alice);
        raffle.enter(_proof1(bob));
        vm.prank(bob);
        raffle.enter(_proof1(alice));

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
        raffle.enter(_proof1(alice));

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
        _setAllowlist2(alice, bob);

        vm.prank(alice);
        raffle.enter(_proof1(bob));

        vm.prank(alice);
        vm.expectRevert(RuxxellsRaffle.AlreadyEntered.selector);
        raffle.enter(_proof1(bob));
    }

    function test_raffleFullOnceEntriesMatchSupply() public {
        _deposit(1);
        vm.prank(owner);
        raffle.openEntries(30 minutes);
        _setAllowlist2(alice, bob);

        vm.prank(alice);
        raffle.enter(_proof1(bob));

        vm.prank(bob);
        vm.expectRevert(RuxxellsRaffle.RaffleFull.selector);
        raffle.enter(_proof1(alice));
    }

    function test_ineligibleCannotEnter() public {
        _deposit(1);
        _deposit(2);
        vm.prank(owner);
        raffle.openEntries(30 minutes);
        _setAllowlist2(alice, bob);

        // carol is not in the {alice, bob} tree
        vm.prank(carol);
        vm.expectRevert(RuxxellsRaffle.NotEligible.selector);
        raffle.enter(_proof1(bob));
    }

    function test_enterRevertsWithoutAllowlist() public {
        _deposit(1);
        vm.prank(owner);
        raffle.openEntries(30 minutes);
        // no merkle root set

        bytes32[] memory empty = new bytes32[](0);
        vm.prank(alice);
        vm.expectRevert(RuxxellsRaffle.NoAllowlist.selector);
        raffle.enter(empty);
    }

    function test_singleLeafAllowlist_emptyProof() public {
        _deposit(1);
        vm.prank(owner);
        raffle.openEntries(30 minutes);
        // a 1-wallet allowlist: root == leaf, proof is empty
        vm.prank(owner);
        raffle.setMerkleRoot(_leaf(alice));

        bytes32[] memory empty = new bytes32[](0);
        vm.prank(alice);
        raffle.enter(empty);
        assertTrue(raffle.hasEntered(alice));
    }

    function test_sweepRequiresFullDistribution() public {
        _deposit(1);
        _deposit(2);
        vm.prank(owner);
        raffle.openEntries(30 minutes);
        _setAllowlist2(alice, bob);

        vm.prank(alice);
        raffle.enter(_proof1(bob));

        vm.warp(block.timestamp + 31 minutes);

        vm.prank(owner);
        vm.expectRevert(RuxxellsRaffle.NotFullyDistributed.selector);
        raffle.sweepUnclaimed();
    }

    function test_cannotSweepTwice() public {
        _deposit(1);
        vm.prank(owner);
        raffle.openEntries(30 minutes);
        _setAllowlist2(alice, bob);

        vm.prank(alice);
        raffle.enter(_proof1(bob));

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
        vm.expectRevert(OwnableMinimal.NotOwner.selector);
        raffle.openEntries(30 minutes);

        vm.prank(alice);
        vm.expectRevert(OwnableMinimal.NotOwner.selector);
        raffle.setMerkleRoot(_leaf(alice));

        vm.prank(owner);
        raffle.openEntries(30 minutes);

        vm.warp(block.timestamp + 31 minutes);

        vm.prank(alice);
        vm.expectRevert(OwnableMinimal.NotOwner.selector);
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
