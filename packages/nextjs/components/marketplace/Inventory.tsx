import React, { useEffect } from "react";
import data from "../../data/pluginInfo.json";
import { SafeGlobalLogo } from "../assets/SafeGlobalLogo";
import { useWalletClient } from "wagmi";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

const Inventory = () => {
  const [expiresAt, setExpiresAt] = React.useState<string[]>(new Array(data.length).fill("-"));
  const { data: walletClient } = useWalletClient();
  const { data: collection } = useScaffoldContract({
    contractName: "ModuleCollection",
    walletClient,
  });

  useEffect(() => {
    if (walletClient) {
      data.forEach(item => {
        getBalanceForPlugin(item.deploymentResult.address);
      });
    }
  }, []);

  const getBalanceForPlugin = async (pluginAddress: string) => {
    if (collection && walletClient) {
      const tokenId = await collection.read.getModuleId([pluginAddress]);
      const balance = await collection.read.balanceOf([walletClient.account.address, tokenId]);
      if (balance > 0n) {
        expiresAt[parseInt(tokenId.toString())] = "∞";
        setExpiresAt(expiresAt);
        return;
      }

      const usableBalance = await collection.read.usableBalanceOf([walletClient.account.address, tokenId]);
      if (usableBalance == 0n) return;

      const recordId = await collection.read.computeRecordId([walletClient.account.address, tokenId]);
      const record = await collection.read.userRecordOf([recordId]);

      expiresAt[parseInt(tokenId.toString())] = new Date(parseInt(record.expiry.toString())).toDateString();
      setExpiresAt(expiresAt);
    }
  };

  const enable = async () => {
    // enable, speak to manager
  };

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Address</th>
            <th>Expires At</th>
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
              <td>{expiresAt[parseInt(item.deploymentResult.tokenId) - 1]}</td>
              <td>
                <button onClick={enable} className="btn btn-primary">
                  Enable
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;
