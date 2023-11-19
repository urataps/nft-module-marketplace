import React, { useEffect } from "react";
import data from "../../data/pluginInfo.json";
import { SafeGlobalLogo } from "../assets/SafeGlobalLogo";
import { useWalletClient } from "wagmi";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

const Inventory = () => {
  const [expiresAt, setExpiresAt] = React.useState<Array<string>>(new Array(data.length).fill("-"));
  const { data: walletClient } = useWalletClient();
  const { data: collection } = useScaffoldContract({
    contractName: "ModuleCollection",
    walletClient,
  });
  const { data: manager } = useScaffoldContract({
    contractName: "SafeProtocolManagerMock",
    walletClient,
  });

  useEffect(() => {
    if (collection && walletClient) {
      const getBalanceForPlugin = async (tokenId: bigint) => {
        const newExpiresAt = [...expiresAt];
        const balance = await collection.read.balanceOf([walletClient.account.address, tokenId]);
        if (balance != 0n) {
          newExpiresAt[parseInt(tokenId.toString()) - 1] = "∞";
          setExpiresAt(newExpiresAt);
          return;
        }

        const usableBalance = await collection.read.usableBalanceOf([walletClient.account.address, tokenId]);
        if (usableBalance == 0n) return;
        const recordId = await collection.read.computeRecordId([walletClient.account.address, tokenId]);
        const record = await collection.read.userRecordOf([recordId]);

        newExpiresAt[parseInt(tokenId.toString()) - 1] = new Date(
          parseInt(record.expiry.toString()) * 1000,
        ).toDateString();
        setExpiresAt(newExpiresAt);
      };
      data.forEach(item => {
        getBalanceForPlugin(BigInt(item.deploymentResult.tokenId));
      });
    }
  }, [walletClient]);

  const enable = async (tokenId: bigint) => {
    if (collection && manager && walletClient) {
      const address = await collection.read.getModuleAddress([tokenId]);
      const balanceOf = await collection.read.balanceOf([walletClient.account.address, tokenId]);
      const usableBalance = await collection.read.usableBalanceOf([walletClient.account.address, tokenId]);
      console.log(balanceOf.toString(), usableBalance.toString());

      // can throw
      await manager.write.enablePlugin([address, 0]);
    }
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
                <button onClick={() => enable(BigInt(item.deploymentResult.tokenId))} className="btn btn-primary">
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
