/// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.21;

import { ISafeProtocolManager, ISafe } from "@safe-global/safe-core-protocol/contracts/interfaces/Manager.sol";
import { SafeTransaction, SafeRootAccess } from "@safe-global/safe-core-protocol/contracts/DataTypes.sol";
import { TokenizedModuleBase, ModuleCollection } from "../TokenizedModuleBase.sol";

contract SafeProtocolManagerMock is ISafeProtocolManager, TokenizedModuleBase {
	constructor(ModuleCollection collection) TokenizedModuleBase(collection) {}

	function executeTransaction(
		ISafe account,
		SafeTransaction calldata transaction
	) external onlyRentedCall returns (bytes[] memory data) {
		// do smth
	}

	function executeRootAccess(
		ISafe account,
		SafeRootAccess calldata rootAccess
	) external onlyRentedDelegateCall returns (bytes memory data) {
		// do smth
	}

	function enablePlugin(
		address plugin,
		uint8 permissions
	) external onlyRentedOrOwned(msg.sender, plugin) {
		// do smth
	}
}
