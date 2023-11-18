/// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.21;

interface IModuleCollection {
	struct RoyaltyInfo {
		address recipient;
		uint96 royaltyBps;
	}

	event ModuleAdded(address indexed module);
	event ModuleFlagged(address indexed module);

	function addModule(
		address module,
		string calldata moduleUri,
		RoyaltyInfo calldata info
	) external returns (uint256 moduleId);

	function flagModule(address module) external;

	function mintModule(address to, uint256 moduleId, uint256 amount) external;

	function getModuleId(
		address module
	) external view returns (uint256 moduleId);

	function getModuleAddress(
		uint256 moduleId
	) external view returns (address module);

	function isModuleFlagged(address module) external view returns (bool);

	function unfrozenBalanceOf(
		address owner,
		uint256 moduleId
	) external view returns (uint256);
}
