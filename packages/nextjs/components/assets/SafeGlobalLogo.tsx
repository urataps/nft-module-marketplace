// take width and height as props
import React from "react";

type SafeGlobalLogoProps = {
  width?: number;
  height?: number;
};

export const SafeGlobalLogo = (props?: SafeGlobalLogoProps) => {
  return (
    <img
      src="https://avatars.githubusercontent.com/u/102983781?s=200&v=4"
      alt="Safe Global NFT"
      width={props?.width}
      height={props?.height}
    />
  );
};
