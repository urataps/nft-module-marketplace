import React from "react";
import { useRouter } from "next/router";
import NftDetail from "~~/components/marketplace/NftDetail";

const NftDetailPage = () => {
  const router = useRouter();
  const { tokenId } = router.query as { tokenId: string };

  return (
    <div>
      <NftDetail tokenId={tokenId} />
    </div>
  );
};

export default NftDetailPage;
