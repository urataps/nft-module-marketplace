/// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.21;

import { ModuleCollection } from "./ModuleCollection.sol";

interface IMarketplace {
	enum ListingType {
		SALE,
		LOAN
	}

	enum ListingStatus {
		UNSET,
		CREATED,
		COMPLETED,
		CANCELLED
	}

	struct ListingParameters {
		uint256 moduleId;
		address owner;
		ListingType listingType;
		uint256 price; // pricePerDay if type is loan
		uint256 nonce;
	}

	struct Listing {
		uint256 moduleId;
		address owner;
		ListingType listingType;
		uint256 price;
		ListingStatus status;
	}

	event ListingStatusChanged(uint256 indexed listingId, ListingStatus status);

	/**
	 * @notice List a module for sale or loan.
	 * @param params Listing parameters.
	 * @return listingId The ID of the listing.
	 */
	function list(
		ListingParameters calldata params
	) external returns (uint256 listingId);

	/**
	 * @notice Buy a module that must be listed for sale.
	 * NOTE: Both parties must approve the marketplace contract beforehand
	 * @param listingId The ID of the listing.
	 */
	function buy(uint256 listingId) external payable;

	/**
	 * @notice Rent a module that must be listed for loan.
	 * NOTE: Both parties must approve the marketplace contract beforehand
	 * @param listingId The ID of the listing.
	 * @param moduleUser The address that will be able to use the module.
	 * @param duration The duration of the loan in seconds.
	 */
	function rent(
		uint256 listingId,
		address moduleUser,
		uint64 duration
	) external payable;

	function cancel(uint256 listingId) external;

	function getListing(
		uint256 listingId
	) external view returns (Listing memory);

	function computeListingId(
		ListingParameters memory params
	) external pure returns (uint256 listingId);

	function moduleCollection() external view returns (ModuleCollection);
}
