//SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import { ERC1155URIStorage, ERC1155 } from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import { IERC2981 } from "@openzeppelin/contracts/interfaces/IERC2981.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC5006 } from "./IERC5006.sol";

contract ModuleCollection is IERC2981, ERC1155URIStorage, Ownable {
	struct RoyaltyInfo {
		address recipient;
		uint96 royaltyBps;
	}

	event ModuleAdded(address indexed module);
	event ModuleFlagged(address indexed module);

	uint256 public totalModules;
	mapping(address module => uint256 moduleId) private _moduleIds;
	mapping(uint256 moduleId => address module) private _moduleAddresses;
	mapping(uint256 moduleId => RoyaltyInfo info) private _royaltyInfos;

	constructor() ERC1155("") {}

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
}
