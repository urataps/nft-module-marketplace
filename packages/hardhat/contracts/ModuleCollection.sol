//SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import { ERC1155URIStorage, ERC1155 } from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import { IERC2981 } from "@openzeppelin/contracts/interfaces/IERC2981.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC5006 } from "./IERC5006.sol";

contract ModuleCollection is IERC2981, IERC5006, ERC1155URIStorage, Ownable {
	struct RoyaltyInfo {
		address recipient;
		uint96 royaltyBps;
	}

	event ModuleAdded(address indexed module);
	event ModuleFlagged(address indexed module);

	// Module management variables
	uint256 public totalModules;
	mapping(address module => uint256 moduleId) private _moduleIds;
	mapping(uint256 moduleId => address module) private _moduleAddresses;
	mapping(uint256 moduleId => RoyaltyInfo info) private _royaltyInfos;

	// Module renting variables
	mapping(uint256 recordId => UserRecord record) private _records;
	mapping(address owner => mapping(uint256 moduleId => uint256 amount))
		private _frozenAmounts;

	constructor(address initialOwner) ERC1155("") Ownable(initialOwner) {}

	function addModule(
		address module,
		string calldata moduleUri,
		RoyaltyInfo calldata info
	) external onlyOwner returns (uint256 moduleId) {
		require(_moduleIds[module] == 0, "Module already added");
		require(bytes(moduleUri).length > 0, "Module URI cannot be empty");

		moduleId = totalModules + 1;
		totalModules = moduleId;

		_moduleIds[module] = moduleId;
		_moduleAddresses[moduleId] = module;
		_royaltyInfos[moduleId] = info;
		_setURI(moduleId, moduleUri);

		emit ModuleAdded(module);
	}

	function flagModule(address module) external onlyOwner {
		uint256 moduleId = _moduleIds[module];
		require(moduleId != 0, "Module not found");

		// delete only address mapping
		delete _moduleAddresses[moduleId];

		emit ModuleFlagged(module);
	}

	function mintModule(
		address to,
		uint256 moduleId,
		uint256 amount
	) external onlyOwner {
		require(to != address(0), "Cannot mint to zero address");
		require(_moduleAddresses[moduleId] != address(0), "Module not found");

		_mint(to, moduleId, amount, "");
	}

	/// @inheritdoc IERC5006
	function createUserRecord(
		address owner,
		address user,
		uint256 moduleId,
		uint64 amount,
		uint64 expiry
	) external returns (uint256 recordId) {
		require(_isApprovedOrOwner(owner), "Not approved or owner");
		require(amount == 1, "Only 1 module at a time");
		require(expiry > block.timestamp, "Expiry must be in the future");
		require(unfrozenBalanceOf(owner, moduleId) > 0, "Insufficient balance");
		recordId = _computeRecordId(user, moduleId);
		require(_records[recordId].tokenId == 0, "Record already exists");

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
		require(_isApprovedOrOwner(record.owner), "Not approved or owner");

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

	function isModuleFlagged(address module) public view returns (bool) {
		return _moduleAddresses[_moduleIds[module]] == address(0);
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

				require(
					amount <= unfrozenBalanceOf(from, moduleId),
					"Insufficient balance"
				);
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
