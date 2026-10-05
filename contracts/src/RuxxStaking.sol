// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * RuxxStaking
 * ---------------------------------------------------------------------------
 * Stake Ruxxells NFTs to mine $RUXX Points.
 *
 *  - Lock options: 7, 14, 30 or 60 days (chosen per stake call).
 *  - Rate: 500 points per day per staked NFT, flat, whatever lock you pick.
 *  - Points accrue per second while the NFT is staked, up to the end of its
 *    lock. After that the NFT stops earning until it is unstaked and staked
 *    again.
 *  - NFTs cannot be unstaked before the lock ends.
 *  - Points are plain on-chain accounting (no token). Unstaking banks the
 *    NFT's points to the owner; `pointsOf` returns banked + still-accruing.
 *  - No owner, no admin, no upgrade path. Nobody can move a staked NFT except
 *    its staker, after the lock.
 *
 * Direct safeTransferFrom to this contract reverts on purpose (no
 * onERC721Received), so NFTs can't be lost by sending them here by mistake.
 * Always go through `stake`.
 * ---------------------------------------------------------------------------
 */

interface IERC721Stakeable {
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
}

contract RuxxStaking {
    IERC721Stakeable public immutable nft;

    uint256 public constant POINTS_PER_DAY = 500;
    uint256 private constant DAY = 1 days;
    uint256 public constant MAX_BATCH = 50;

    struct StakeInfo {
        address owner;
        uint64 start;
        uint64 unlock;
    }

    mapping(uint256 => StakeInfo) public stakes; // tokenId => stake
    mapping(address => uint256[]) private _staked; // staker => tokenIds
    mapping(uint256 => uint256) private _indexPlusOne; // tokenId => index+1 in _staked
    mapping(address => uint256) public bankedPoints;

    uint256 public totalStaked;
    uint256 private _lock = 1;

    event Staked(address indexed user, uint256 indexed tokenId, uint256 lockDays, uint64 unlockAt);
    event Unstaked(address indexed user, uint256 indexed tokenId, uint256 pointsEarned);

    error BadDuration();
    error BadBatch();
    error NotStaker();
    error StillLocked();
    error Reentrancy();

    modifier nonReentrant() {
        if (_lock != 1) revert Reentrancy();
        _lock = 2;
        _;
        _lock = 1;
    }

    constructor(address nftAddress) {
        nft = IERC721Stakeable(nftAddress);
    }

    /* ------------------------------------------------------------ write */

    /// @notice Stake `tokenIds` for `lockDays` (7, 14, 30 or 60). Caller must
    /// have approved this contract (setApprovalForAll or per-token approve).
    function stake(uint256[] calldata tokenIds, uint256 lockDays) external nonReentrant {
        if (lockDays != 7 && lockDays != 14 && lockDays != 30 && lockDays != 60) revert BadDuration();
        uint256 n = tokenIds.length;
        if (n == 0 || n > MAX_BATCH) revert BadBatch();

        uint64 start = uint64(block.timestamp);
        uint64 unlockAt = uint64(block.timestamp + lockDays * DAY);

        for (uint256 i = 0; i < n; i++) {
            uint256 id = tokenIds[i];
            // Records first, then pulls. transferFrom reverts unless msg.sender
            // owns the token and has approved this contract.
            stakes[id] = StakeInfo({owner: msg.sender, start: start, unlock: unlockAt});
            _staked[msg.sender].push(id);
            _indexPlusOne[id] = _staked[msg.sender].length;
            nft.transferFrom(msg.sender, address(this), id);
            emit Staked(msg.sender, id, lockDays, unlockAt);
        }
        totalStaked += n;
    }

    /// @notice Unstake `tokenIds` once their locks have ended. Banks the points.
    function unstake(uint256[] calldata tokenIds) external nonReentrant {
        uint256 n = tokenIds.length;
        if (n == 0 || n > MAX_BATCH) revert BadBatch();

        uint256 earnedTotal;
        for (uint256 i = 0; i < n; i++) {
            uint256 id = tokenIds[i];
            StakeInfo memory s = stakes[id];
            if (s.owner != msg.sender) revert NotStaker();
            if (block.timestamp < s.unlock) revert StillLocked();

            uint256 earned = _earned(s);
            earnedTotal += earned;

            // remove from the staker's list (swap and pop)
            uint256[] storage list = _staked[msg.sender];
            uint256 idx = _indexPlusOne[id] - 1;
            uint256 lastId = list[list.length - 1];
            list[idx] = lastId;
            _indexPlusOne[lastId] = idx + 1;
            list.pop();
            delete _indexPlusOne[id];
            delete stakes[id];

            nft.transferFrom(address(this), msg.sender, id);
            emit Unstaked(msg.sender, id, earned);
        }
        bankedPoints[msg.sender] += earnedTotal;
        totalStaked -= n;
    }

    /* ------------------------------------------------------------- read */

    /// @notice Total points for `user`: banked from unstaked NFTs plus what
    /// their currently staked NFTs have accrued so far.
    function pointsOf(address user) external view returns (uint256 total) {
        total = bankedPoints[user];
        uint256[] storage list = _staked[user];
        for (uint256 i = 0; i < list.length; i++) {
            total += _earned(stakes[list[i]]);
        }
    }

    /// @notice Everything the UI needs for a wallet's staked NFTs.
    function stakedOf(address user)
        external
        view
        returns (uint256[] memory ids, uint64[] memory starts, uint64[] memory unlocks, uint256[] memory earned)
    {
        uint256[] storage list = _staked[user];
        uint256 n = list.length;
        ids = new uint256[](n);
        starts = new uint64[](n);
        unlocks = new uint64[](n);
        earned = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            StakeInfo memory s = stakes[list[i]];
            ids[i] = list[i];
            starts[i] = s.start;
            unlocks[i] = s.unlock;
            earned[i] = _earned(s);
        }
    }

    function stakedCount(address user) external view returns (uint256) {
        return _staked[user].length;
    }

    /* --------------------------------------------------------- internal */

    function _earned(StakeInfo memory s) private view returns (uint256) {
        uint256 end = block.timestamp < s.unlock ? block.timestamp : s.unlock;
        if (end <= s.start) return 0;
        return ((end - s.start) * POINTS_PER_DAY) / DAY;
    }
}
