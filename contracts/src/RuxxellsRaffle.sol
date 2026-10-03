// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * RuxxellsRaffle
 * ---------------------------------------------------------------------------
 * Holds a batch of Ruxxells NFTs deposited by the team Safe. Eligible wallets
 * "enter" during a fixed time window (no NFT moves yet, just a recorded
 * entry). Every entrant is guaranteed exactly one NFT -- entries are capped
 * at the number of NFTs deposited, so this is delayed 1:1 distribution, not
 * a lottery. After the window closes, the team calls `distribute` (in
 * batches, so it's safe regardless of how many people entered) to send every
 * entrant their NFT. Any NFTs left over because fewer people entered than
 * were deposited are swept back to the team vault with `sweepUnclaimed`.
 *
 * Deploy this with the team Safe as the constructor's `initialOwner`, or
 * deploy from any address and immediately call `transferOwnership` to the
 * Safe -- every admin action (opening entries, distributing, sweeping) is
 * owner-gated.
 * ---------------------------------------------------------------------------
 */

/* --------------------------------------------------------------------- */
/*                         minimal external interfaces                    */
/* --------------------------------------------------------------------- */

interface IERC721Minimal {
    function ownerOf(uint256 tokenId) external view returns (address);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
}

interface IERC721ReceiverMinimal {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}

/* --------------------------------------------------------------------- */
/*                                Ownable                                 */
/* --------------------------------------------------------------------- */

abstract contract OwnableMinimal {
    address public owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error NotOwner();
    error ZeroAddress();

    constructor(address initialOwner) {
        if (initialOwner == address(0)) revert ZeroAddress();
        owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

/* --------------------------------------------------------------------- */
/*                             ReentrancyGuard                            */
/* --------------------------------------------------------------------- */

abstract contract ReentrancyGuardMinimal {
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;
    uint256 private status = NOT_ENTERED;

    error Reentrant();

    modifier nonReentrant() {
        if (status == ENTERED) revert Reentrant();
        status = ENTERED;
        _;
        status = NOT_ENTERED;
    }
}

/* --------------------------------------------------------------------- */
/*                               the raffle                               */
/* --------------------------------------------------------------------- */

contract RuxxellsRaffle is OwnableMinimal, ReentrancyGuardMinimal, IERC721ReceiverMinimal {
    /// @notice The Ruxxells NFT collection this raffle distributes.
    IERC721Minimal public immutable nft;

    /// @notice Where leftover (unentered) NFTs go once distribution is done.
    address public constant TEAM_VAULT = 0xCedBE9a8b29d4E80f04eb6718B2510fc66F7EFE2;

    /// @notice Token IDs deposited into this contract, in deposit order.
    uint256[] public depositedTokenIds;

    /// @notice Wallets that entered, in entry order. entrants[i] receives
    /// depositedTokenIds[i] when distributed.
    address[] public entrants;

    /// @notice Whether a wallet has already entered (one entry per wallet).
    mapping(address => bool) public hasEntered;

    /// @notice Unix timestamp entries close at. 0 means entries haven't opened.
    uint256 public entryDeadline;

    /// @notice How many entrants have been paid out so far. Also the index
    /// into `entrants`/`depositedTokenIds` that `distribute` resumes from.
    uint256 public nextToDistribute;

    /// @notice True once leftover NFTs have been swept to the team vault.
    bool public swept;

    event Deposited(uint256 tokenId, uint256 totalDeposited);
    event EntriesOpened(uint256 deadline);
    event Entered(address indexed wallet, uint256 position);
    event Distributed(address indexed wallet, uint256 tokenId);
    event Swept(address indexed to, uint256 tokenId);

    error NoDeposits();
    error AlreadyOpened();
    error EntriesNotOpen();
    error EntriesClosed();
    error EntriesStillOpen();
    error AlreadyEntered();
    error RaffleFull();
    error NothingToDistribute();
    error NotFullyDistributed();
    error AlreadySwept();
    error WrongCollection();

    constructor(address nftContract, address initialOwner) OwnableMinimal(initialOwner) {
        if (nftContract == address(0)) revert ZeroAddress();
        nft = IERC721Minimal(nftContract);
    }

    /* ----------------------------- deposits ----------------------------- */

    /// @dev Called automatically when the Safe (or anyone) sends an NFT here
    /// via `safeTransferFrom`. Only accepts tokens from the configured
    /// collection, and only before entries have opened.
    function onERC721Received(
        address /* operator */,
        address /* from */,
        uint256 tokenId,
        bytes calldata /* data */
    ) external override returns (bytes4) {
        if (msg.sender != address(nft)) revert WrongCollection();
        if (entryDeadline != 0) revert AlreadyOpened();
        depositedTokenIds.push(tokenId);
        emit Deposited(tokenId, depositedTokenIds.length);
        return IERC721ReceiverMinimal.onERC721Received.selector;
    }

    /* ----------------------------- entries ------------------------------ */

    /// @notice Opens the entry window for `durationSeconds` starting now.
    /// Can only be called once, and only after NFTs have been deposited.
    function openEntries(uint256 durationSeconds) external onlyOwner {
        if (depositedTokenIds.length == 0) revert NoDeposits();
        if (entryDeadline != 0) revert AlreadyOpened();
        entryDeadline = block.timestamp + durationSeconds;
        emit EntriesOpened(entryDeadline);
    }

    /// @notice Enter the raffle. One entry per wallet. Reverts once entries
    /// have closed, or once every deposited NFT already has an entrant.
    function enter() external nonReentrant {
        if (entryDeadline == 0 || block.timestamp >= entryDeadline) revert EntriesNotOpen();
        if (hasEntered[msg.sender]) revert AlreadyEntered();
        if (entrants.length >= depositedTokenIds.length) revert RaffleFull();

        hasEntered[msg.sender] = true;
        entrants.push(msg.sender);
        emit Entered(msg.sender, entrants.length - 1);
    }

    /* --------------------------- distribution ---------------------------- */

    /// @notice Sends up to `count` more entrants their NFT, in entry order.
    /// Call this repeatedly (it's safe to call many times) until
    /// `remainingToDistribute() == 0`. Owner-only, and only after the entry
    /// window has closed.
    function distribute(uint256 count) external onlyOwner nonReentrant {
        if (entryDeadline == 0 || block.timestamp < entryDeadline) revert EntriesStillOpen();

        uint256 start = nextToDistribute;
        uint256 total = entrants.length;
        if (start >= total) revert NothingToDistribute();

        uint256 end = start + count;
        if (end > total) end = total;

        for (uint256 i = start; i < end; i++) {
            address who = entrants[i];
            uint256 tokenId = depositedTokenIds[i];
            nft.safeTransferFrom(address(this), who, tokenId);
            emit Distributed(who, tokenId);
        }

        nextToDistribute = end;
    }

    /// @notice Sends every deposited NFT beyond what entrants used back to
    /// the team vault. Only once all entrants have been paid, and only once.
    function sweepUnclaimed() external onlyOwner nonReentrant {
        if (entryDeadline == 0 || block.timestamp < entryDeadline) revert EntriesStillOpen();
        if (nextToDistribute != entrants.length) revert NotFullyDistributed();
        if (swept) revert AlreadySwept();

        swept = true;
        uint256 totalDeposited = depositedTokenIds.length;
        for (uint256 i = entrants.length; i < totalDeposited; i++) {
            uint256 tokenId = depositedTokenIds[i];
            nft.safeTransferFrom(address(this), TEAM_VAULT, tokenId);
            emit Swept(TEAM_VAULT, tokenId);
        }
    }

    /* ------------------------------ views -------------------------------- */

    function depositedCount() external view returns (uint256) {
        return depositedTokenIds.length;
    }

    function entrantsCount() external view returns (uint256) {
        return entrants.length;
    }

    function remainingToDistribute() external view returns (uint256) {
        return entrants.length - nextToDistribute;
    }

    /// @notice NFTs that will go to the vault if the window closed right now
    /// with no more entries (deposited minus entered).
    function unclaimedCount() external view returns (uint256) {
        return depositedTokenIds.length - entrants.length;
    }

    function isOpen() external view returns (bool) {
        return entryDeadline != 0 && block.timestamp < entryDeadline;
    }
}
