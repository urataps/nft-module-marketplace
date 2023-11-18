import React from "react";
import Link from "next/link";
import data from "../../data/data.json";
import { SafeGlobalLogo } from "../assets/SafeGlobalLogo";

const Table = () => {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th>tokenId</th>
            <th>Name</th>
            <th>Address</th>
            <th>Buy Price</th>
            <th>Rent Price</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.tokenId}</td>
              <td>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="mask mask-squircle w-12 h-12">
                      <SafeGlobalLogo />
                    </div>
                  </div>
                  <div className="font-bold">{item.name}</div>
                </div>
              </td>
              <td>{item.address}</td>
              <td>{item.price}</td>
              <td>{item.rentingPrice}</td>
              <td>
                <Link href={`/token/${item.tokenId}`}>
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

export default Table;
