import React from "react";
import { useRouter } from "next/router";
import RentNftDetail from "~~/components/marketplace/RentNftDetail";

const NftDetailPage = () => {
  const router = useRouter();
  const { tokenId } = router.query as { tokenId: string };

  return (
    <div>
      <RentNftDetail tokenId={tokenId} />
    </div>
  );
};

export default NftDetailPage;
