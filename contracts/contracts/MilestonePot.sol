// SPDX-License-Identifier: MIT
pragma solidity 0.8.31;

/// @notice A group gift pot: contributors fund native MON for a recipient,
/// who can claim the total only after a creator-chosen unlock timestamp.
contract MilestonePot {
    struct Pot {
        address creator;
        address recipient;
        uint64 unlockTimestamp;
        uint256 targetAmount;
        uint256 totalContributed;
        bool claimed;
    }

    mapping(uint256 => Pot) private pots;
    uint256 private nextPotId;

    event PotCreated(
        uint256 indexed potId,
        address indexed creator,
        address indexed recipient,
        uint64 unlockTimestamp,
        uint256 targetAmount
    );
    event ContributionMade(
        uint256 indexed potId,
        address indexed contributor,
        uint256 amount,
        uint256 totalContributed
    );
    event PotClaimed(uint256 indexed potId, address indexed recipient, uint256 amount);

    error InvalidRecipient();
    error InvalidUnlockTimestamp();
    error PotDoesNotExist();
    error ZeroContribution();
    error PotAlreadyClaimed();
    error NotRecipient();
    error NotYetUnlocked();
    error TransferFailed();

    /// @notice Creates a new pot for `recipient`, unlockable at `unlockTimestamp`.
    /// Optionally seed it with an initial contribution by sending MON with the call.
    /// @param targetAmount Optional informational target (0 means none); not enforced on-chain.
    function createPot(
        address recipient,
        uint64 unlockTimestamp,
        uint256 targetAmount
    ) external payable returns (uint256 potId) {
        if (recipient == address(0)) revert InvalidRecipient();
        if (unlockTimestamp <= block.timestamp) revert InvalidUnlockTimestamp();

        potId = nextPotId++;
        Pot storage pot = pots[potId];
        pot.creator = msg.sender;
        pot.recipient = recipient;
        pot.unlockTimestamp = unlockTimestamp;
        pot.targetAmount = targetAmount;

        emit PotCreated(potId, msg.sender, recipient, unlockTimestamp, targetAmount);

        if (msg.value > 0) {
            _recordContribution(potId, pot);
        }
    }

    /// @notice Contributes native MON to an existing, unclaimed pot.
    function contribute(uint256 potId) external payable {
        if (msg.value == 0) revert ZeroContribution();

        Pot storage pot = pots[potId];
        if (pot.recipient == address(0)) revert PotDoesNotExist();
        if (pot.claimed) revert PotAlreadyClaimed();

        _recordContribution(potId, pot);
    }

    /// @notice Lets the designated recipient claim the full pot balance after unlock.
    function claim(uint256 potId) external {
        Pot storage pot = pots[potId];
        if (pot.recipient == address(0)) revert PotDoesNotExist();
        if (msg.sender != pot.recipient) revert NotRecipient();
        if (block.timestamp < pot.unlockTimestamp) revert NotYetUnlocked();
        if (pot.claimed) revert PotAlreadyClaimed();

        uint256 amount = pot.totalContributed;

        // Effects before interaction: mark claimed before sending value.
        pot.claimed = true;

        (bool success, ) = pot.recipient.call{value: amount}("");
        if (!success) revert TransferFailed();

        emit PotClaimed(potId, pot.recipient, amount);
    }

    /// @notice Returns full pot details.
    function getPot(uint256 potId) external view returns (Pot memory) {
        return pots[potId];
    }

    /// @notice Total number of pots ever created; valid pot ids are `0 .. potCount() - 1`.
    function potCount() external view returns (uint256) {
        return nextPotId;
    }

    /// @notice Whether a pot with this id was created.
    function potExists(uint256 potId) external view returns (bool) {
        return pots[potId].recipient != address(0);
    }

    function _recordContribution(uint256 potId, Pot storage pot) private {
        pot.totalContributed += msg.value;
        emit ContributionMade(potId, msg.sender, msg.value, pot.totalContributed);
    }
}
