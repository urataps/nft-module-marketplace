/// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.21;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { IMarketplace } from "./IMarketplace.sol";
import { ModuleCollection } from "./ModuleCollection.sol";

contract Marketplace is IMarketplace {
	error NotOwner();
	error AlreadyListed();
	error InsufficientBalance();
	error NotCreated();
	error NotSale();
	error NotLoan();
	error NotCancelled();

	ModuleCollection public immutable moduleCollection;
	mapping(uint256 listingId => Listing listing) private _listings;

	constructor(address _moduleCollection) {
		moduleCollection = ModuleCollection(_moduleCollection);
	}

	function list(
		ListingParameters calldata params
	) external returns (uint256 listingId) {
		if (params.owner != msg.sender) revert NotOwner();
		listingId = computeListingId(params);
		if (_listings[listingId].status != ListingStatus.UNSET) {
			revert AlreadyListed();
		}
		if (
			moduleCollection.unfrozenBalanceOf(params.owner, params.moduleId) ==
			0
		) {
			revert InsufficientBalance();
		}

		_listings[listingId] = Listing({
			moduleId: params.moduleId,
			owner: params.owner,
			listingType: params.listingType,
			price: params.price,
			status: ListingStatus.CREATED
		});

		emit ListingStatusChanged(listingId, ListingStatus.CREATED);
	}

	function buy(uint256 listingId) external payable {
		Listing memory listing = _listings[listingId];
		if (listing.status != ListingStatus.CREATED) revert NotCreated();
		if (listing.listingType != ListingType.SALE) revert NotSale();
		if (msg.value < listing.price) revert InsufficientBalance();

		// _listings[listingId].status = ListingStatus.COMPLETED;

		emit ListingStatusChanged(listingId, ListingStatus.COMPLETED);

		moduleCollection.safeTransferFrom(
			listing.owner,
			msg.sender,
			listing.moduleId,
			1,
			""
		);
		Address.sendValue(payable(listing.owner), listing.price);
		// todo: refund excess
	}

	function rent(
		uint256 listingId,
		address moduleUser,
		uint64 durationDays
	) external payable {
		Listing memory listing = _listings[listingId];
		if (listing.status != ListingStatus.CREATED) revert NotCreated();
		if (listing.listingType != ListingType.LOAN) revert NotLoan();
		// price is pricePerDay
		uint256 rentPrice = listing.price * durationDays;
		if (msg.value < rentPrice) revert InsufficientBalance();

		// _listings[listingId].status = ListingStatus.COMPLETED;

		emit ListingStatusChanged(listingId, ListingStatus.COMPLETED);

		// Price is per day, duration is in seconds
		Address.sendValue(payable(listing.owner), rentPrice);
		moduleCollection.createUserRecord(
			listing.owner,
			moduleUser,
			listing.moduleId,
			1,
			uint64(block.timestamp) + durationDays * 1 days
		);

		// todo: refund excess
	}

	function cancel(uint256 listingId) external {
		Listing memory listing = _listings[listingId];
		if (listing.owner != msg.sender) revert NotOwner();
		if (listing.status != ListingStatus.CREATED) revert NotCreated();

		_listings[listingId].status = ListingStatus.CANCELLED;

		emit ListingStatusChanged(listingId, ListingStatus.CANCELLED);
	}

	function getListing(
		uint256 listingId
	) external view returns (Listing memory) {
		return _listings[listingId];
	}

	function computeListingId(
		ListingParameters memory params
	) public pure returns (uint256 listingId) {
		return uint256(keccak256(abi.encode(params)));
	}
}
