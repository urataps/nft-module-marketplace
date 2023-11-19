/// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.21;

import { ModuleCollection } from "./ModuleCollection.sol";

abstract contract TokenizedModuleBase {
	address private immutable _this;
	ModuleCollection private immutable _moduleRegistry;

	constructor(ModuleCollection collection) {
		_moduleRegistry = collection;
		_this = address(this);
	}

	modifier onlyRentedCall() {
		uint256 moduleId = _moduleRegistry.getModuleId(_this);
		require(
			_moduleRegistry.usableBalanceOf(msg.sender, moduleId) > 0,
			"Module not rented"
		);
		_;
	}

	modifier onlyRentedDelegateCall() {
		uint256 moduleId = _moduleRegistry.getModuleId(_this);
		require(
			_moduleRegistry.usableBalanceOf(address(this), moduleId) > 0,
			"Module not rented"
		);
		_;
	}

	modifier onlyRented(address user) {
		uint256 moduleId = _moduleRegistry.getModuleId(_this);
		require(
			_moduleRegistry.usableBalanceOf(user, moduleId) > 0,
			"Module not rented"
		);
		_;
	}

	modifier onlyOwned(address user) {
		uint256 moduleId = _moduleRegistry.getModuleId(_this);
		require(
			_moduleRegistry.balanceOf(user, moduleId) > 0,
			"Module not owned"
		);
		_;
	}

	modifier onlyRentedOrOwned(address user, address module) {
		uint256 moduleId = _moduleRegistry.getModuleId(module);
		require(
			_moduleRegistry.usableBalanceOf(user, moduleId) > 0 ||
				_moduleRegistry.balanceOf(user, moduleId) > 0,
			"Module not rented or owned"
		);
		_;
	}
}
