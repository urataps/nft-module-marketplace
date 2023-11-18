// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import { ERC1155URIStorage, ERC1155 } from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import { IERC2981 } from "@openzeppelin/contracts/interfaces/IERC2981.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ISafeProtocolRegistry } from "@safe-global/safe-core-protocol/contracts/interfaces/Registry.sol";
import { IERC5006 } from "./IERC5006.sol";
import { IModuleCollection } from "./IModuleCollection.sol";

contract ModuleCollection is
	IModuleCollection,
	IERC2981,
	IERC5006,
	ISafeProtocolRegistry,
	ERC1155URIStorage,
	Ownable
{
	error ModuleAlreadyAdded();
	error ModuleURIEmpty();
	error ModuleNotFound();
	error MintToZeroAddress();
	error RecordAlreadyExists();
	error ApprovedOrOwnerRequired();
	error OnlyOneModuleAtATime();
	error ExpiryInFutureRequired();
	error InsufficientBalance();
	error RecordNotFound();

	// Module management variables
	uint256 public totalModules;
	mapping(address => uint256) private _moduleIds;
	mapping(uint256 => address) private _moduleAddresses;
	mapping(uint256 => RoyaltyInfo) private _royaltyInfos;
	mapping(address => ModuleTimestampts) private _moduleTimestamps;

	// Module renting variables
	mapping(uint256 => UserRecord) private _records;
	mapping(address => mapping(uint256 => uint256)) private _frozenAmounts;

	constructor(address initialOwner) ERC1155("") Ownable(initialOwner) {}

	function addModule(
		address module,
		string calldata moduleUri,
		RoyaltyInfo calldata info
	) external onlyOwner returns (uint256 moduleId) {
		if (_moduleIds[module] != 0) revert ModuleAlreadyAdded();
		if (bytes(moduleUri).length == 0) revert ModuleURIEmpty();

		moduleId = totalModules + 1;
		totalModules = moduleId;

		_moduleIds[module] = moduleId;
		_moduleAddresses[moduleId] = module;
		_royaltyInfos[moduleId] = info;
		_moduleTimestamps[module].listedAt = uint64(block.timestamp);
		_setURI(moduleId, moduleUri);

		emit ModuleAdded(module);
	}

	function flagModule(address module) external onlyOwner {
		uint256 moduleId = _moduleIds[module];
		if (moduleId == 0) revert ModuleNotFound();

		_moduleTimestamps[module].flaggedAt = uint64(block.timestamp);

		emit ModuleFlagged(module);
	}

	function mintModule(
		address to,
		uint256 moduleId,
		uint256 amount
	) external onlyOwner {
		if (to == address(0)) revert MintToZeroAddress();
		if (_moduleAddresses[moduleId] == address(0)) revert ModuleNotFound();

		_mint(to, moduleId, amount, "");
	}

	/// @inheritdoc ISafeProtocolRegistry
	function check(
		address module
	) external view returns (uint64 listedAt, uint64 flaggedAt) {
		ModuleTimestampts memory timestamps = _moduleTimestamps[module];
		return (timestamps.listedAt, timestamps.flaggedAt);
	}

	/// @inheritdoc IERC5006
	function createUserRecord(
		address owner,
		address user,
		uint256 moduleId,
		uint64 amount,
		uint64 expiry
	) external returns (uint256 recordId) {
		if (!_isApprovedOrOwner(owner)) revert ApprovedOrOwnerRequired();
		if (amount != 1) revert OnlyOneModuleAtATime();
		if (expiry <= block.timestamp) revert ExpiryInFutureRequired();
		if (unfrozenBalanceOf(owner, moduleId) == 0) {
			revert InsufficientBalance();
		}
		recordId = _computeRecordId(user, moduleId);
		if (_records[recordId].tokenId != 0) revert RecordAlreadyExists();

		_records[recordId] = UserRecord({
			owner: owner,
			user: user,
			tokenId: moduleId,
			amount: amount,
			expiry: expiry
		});
		_frozenAmounts[owner][moduleId] += amount;

		emit CreateUserRecord(recordId, moduleId, amount, owner, user, expiry);
	}

	/// @inheritdoc IERC5006
	function deleteUserRecord(uint256 recordId) external {
		UserRecord memory record = userRecordOf(recordId);
		if (!_isApprovedOrOwner(record.owner)) revert ApprovedOrOwnerRequired();

		_frozenAmounts[record.owner][record.tokenId] -= record.amount;
		delete _records[recordId];

		emit DeleteUserRecord(recordId);
	}

	/// @inheritdoc IERC5006
	function usableBalanceOf(
		address user,
		uint256 moduleId
	) external view returns (uint256) {
		return
			_records[_computeRecordId(user, moduleId)].expiry >= block.timestamp
				? 1
				: 0;
	}

	/// @inheritdoc IERC5006
	function frozenBalanceOf(
		address owner,
		uint256 moduleId
	) public view returns (uint256) {
		return _frozenAmounts[owner][moduleId];
	}

	/// @inheritdoc IERC5006
	function userRecordOf(
		uint256 recordId
	) public view returns (UserRecord memory) {
		return _records[recordId];
	}

	function getModuleId(
		address module
	) external view returns (uint256 moduleId) {
		moduleId = _moduleIds[module];
	}

	function getModuleAddress(
		uint256 moduleId
	) external view returns (address module) {
		module = _moduleAddresses[moduleId];
	}

	/// @inheritdoc IERC2981
	function royaltyInfo(
		uint256 moduleId,
		uint256 salePrice
	) external view returns (address recipient, uint256 royaltyAmount) {
		RoyaltyInfo memory info = _royaltyInfos[moduleId];
		recipient = info.recipient;
		royaltyAmount = (salePrice * info.royaltyBps) / 10000;
	}

	function unfrozenBalanceOf(
		address owner,
		uint256 moduleId
	) public view returns (uint256) {
		return balanceOf(owner, moduleId) - frozenBalanceOf(owner, moduleId);
	}

	function _isApprovedOrOwner(address owner) internal view returns (bool) {
		if (msg.sender != owner && !isApprovedForAll(owner, msg.sender)) {
			return false;
		}
		return true;
	}

	function _update(
		address from,
		address to,
		uint256[] memory ids,
		uint256[] memory amounts
	) internal virtual override {
		// Check unfrozen balance when not minting.
		if (from != address(0)) {
			for (uint256 i = 0; i < ids.length; i++) {
				uint256 moduleId = ids[i];
				uint256 amount = amounts[i];

				if (amount > unfrozenBalanceOf(from, moduleId)) {
					revert InsufficientBalance();
				}
			}
		}
		super._update(from, to, ids, amounts);
	}

	function _computeRecordId(
		address user,
		uint256 moduleId
	) internal pure returns (uint256) {
		return uint256(keccak256(abi.encodePacked(user, moduleId)));
	}
}
