/// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.21;

contract MockPlugin {
	constructor() {}

	function doSmth() external pure returns (uint256) {
		return 42;
	}
}
