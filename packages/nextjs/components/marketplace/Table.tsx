import React from "react";
import data from "../../data/data.json";
import { SafeGlobalLogo } from "../assets/SafeGlobalLogo";

const Table = () => {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>Lister</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="mask mask-squircle w-12 h-12">
                      <SafeGlobalLogo />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-sm opacity-50">{item.location}</div>
                  </div>
                </div>
              </td>
              <td>{item.job}</td>
              <td>{item.favoriteColor}</td>
              <td>
                <button className="btn btn-ghost btn-xs">details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
