import React from "react";
import { useRouter } from "next/router";
import BuyNftDetail from "~~/components/marketplace/BuyNftDetail";

const BuyNftDetailPage = () => {
  const router = useRouter();
  const { tokenId } = router.query as { tokenId: string };

  return (
    <div>
      <BuyNftDetail tokenId={tokenId} />
    </div>
  );
};

export default BuyNftDetailPage;
