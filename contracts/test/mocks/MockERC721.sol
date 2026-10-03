// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @dev Bare-bones ERC721 for tests only -- enough `ownerOf` / `safeTransferFrom`
/// / `mint` behavior to exercise RuxxellsRaffle without pulling in OpenZeppelin.
contract MockERC721 {
    mapping(uint256 => address) public ownerOf;
    mapping(uint256 => address) public getApproved;
    mapping(address => mapping(address => bool)) public isApprovedForAll;

    function mint(address to, uint256 tokenId) external {
        require(ownerOf[tokenId] == address(0), "already minted");
        ownerOf[tokenId] = to;
    }

    function approve(address to, uint256 tokenId) external {
        require(msg.sender == ownerOf[tokenId], "not owner");
        getApproved[tokenId] = to;
    }

    function setApprovalForAll(address operator, bool approved) external {
        isApprovedForAll[msg.sender][operator] = approved;
    }

    function transferFrom(address from, address to, uint256 tokenId) external {
        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) external {
        _transfer(from, to, tokenId);
        if (to.code.length > 0) {
            (bool ok, bytes memory ret) = to.call(
                abi.encodeWithSignature(
                    "onERC721Received(address,address,uint256,bytes)",
                    msg.sender,
                    from,
                    tokenId,
                    ""
                )
            );
            require(ok, "receiver reverted");
            bytes4 selector = abi.decode(ret, (bytes4));
            require(selector == 0x150b7a02, "bad selector");
        }
    }

    function _transfer(address from, address to, uint256 tokenId) internal {
        require(ownerOf[tokenId] == from, "not owner");
        require(
            msg.sender == from || msg.sender == getApproved[tokenId] || isApprovedForAll[from][msg.sender],
            "not authorized"
        );
        getApproved[tokenId] = address(0);
        ownerOf[tokenId] = to;
    }
}
