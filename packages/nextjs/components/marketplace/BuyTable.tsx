import React from "react";
import Link from "next/link";
import data from "../../data/pluginInfo.json";
import { SafeGlobalLogo } from "../assets/SafeGlobalLogo";
import { formatUnits } from "viem";

const BuyTable = () => {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Address</th>
            <th>Buy Price</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.deploymentResult.tokenId}</td>
              <td>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="mask mask-squircle w-12 h-12">
                      <SafeGlobalLogo />
                    </div>
                  </div>
                  <div className="font-bold">{item.deploymentResult.name}</div>
                </div>
              </td>
              <td>{item.deploymentResult.address}</td>
              <td>{formatUnits(BigInt(item.buyPrice), 18)} ETH</td>
              <td>
                <Link href={`/buy/${item.deploymentResult.tokenId}`}>
                  <button className="btn btn-primary">Details</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BuyTable;
