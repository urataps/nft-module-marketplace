/// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.21;

interface IERC5006 {
	struct UserRecord {
		uint256 tokenId;
		address owner;
		uint64 amount;
		address user;
		uint64 expiry;
	}

	/**
	 * @dev Emitted when permission for `user` to use `amount` of `tokenId` token owned by `owner`
	 * until `expiry` are given.
	 */
	event CreateUserRecord(
		uint256 indexed recordId,
		uint256 tokenId,
		uint64 amount,
		address owner,
		address user,
		uint64 expiry
	);

	/**
	 * @dev Emitted when record of `recordId` are deleted.
	 */
	event DeleteUserRecord(uint256 recordId);

	/**
	 * @dev Gives permission to `user` to use `amount` of `moduleId` token owned by `owner` until `expiry`.
	 *
	 * Emits a {CreateUserRecord} event.
	 * Requirements:
	 * - If the caller is not `owner`, it must be have been approved to spend ``owner``'s tokens
	 * via {setApprovalForAll}.
	 *
	 * @param owner must have a balance of tokens of type `id` of at least `amount`.
	 * @param user cannot be the zero address.
	 * @param amount must be greater than 0.
	 * @param expiry must be after the block timestamp.
	 */
	function createUserRecord(
		address owner,
		address user,
		uint256 moduleId,
		uint64 amount,
		uint64 expiry
	) external returns (uint256);

	/**
	 * @dev Atomically delete `record` of `recordId` by the caller.
	 *
	 * Emits a {DeleteUserRecord} event.
	 *
	 * Requirements:
	 *
	 * - the caller must have allowance or be the owner.
	 */
	function deleteUserRecord(uint256 recordId) external;

	/**
	 * @dev Returns the usable amount of `moduleId` tokens by `user`.
	 */
	function usableBalanceOf(
		address user,
		uint256 moduleId
	) external view returns (uint256);

	/**
	 * @notice Returns the amount of frozen tokens of type `moduleId` by `owner`.
	 * @dev Frozen tokens means they are in use by other users.
	 */
	function frozenBalanceOf(
		address owner,
		uint256 moduleId
	) external view returns (uint256);

	/**
	 * @dev Returns the `UserRecord` of `recordId`.
	 * @param recordId The id of the record representing usage information.
	 */
	function userRecordOf(
		uint256 recordId
	) external view returns (UserRecord memory);
}
