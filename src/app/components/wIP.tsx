"use client";

import { custom } from "viem";
import { useWalletClient } from "wagmi";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// example of how you would now use the fully setup sdk

export default function TestComponent() {
  const [wipDeposit, setWipDeposit] = useState("");
  const [handle, sethandleError] = useState("");
  const { data: wallet } = useWalletClient();

  async function setupStoryClient(): Promise<StoryClient | null> {
    if (!wallet) {
      sethandleError("Please connect your wallet first.");
      return null;
    }

    const config: StoryConfig = {
      account: wallet.account,
      transport: custom(wallet.transport),
      chainId: "aeneid",
    };

    return StoryClient.newClient(config);
  }

  async function registerIp() {
    const client = await setupStoryClient();
    if (!client) return;

    try {
      const deposit = await client.wipClient.deposit({ amount: 100 });
      if (deposit) {
        setWipDeposit(deposit.txHash);
        sethandleError("");
      } else {
        sethandleError("Error in depositing wip");
      }
    } catch (error: unknown) {
      sethandleError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  }

  return (
    <div>
      <div className="flex flex-col items-center">
        <Button
          className={`bg-purple-700 hover:bg-purple-500 text-lg text-white p-2 rounded-lg ${poppins.className}`}
          onClick={() => registerIp()}
        >
          Wrap to wIP
        </Button>
      </div>
      {handle && (
        <p className="text-black bg-red-500 p-2 pl-3 mt-2 rounded-md">
          {handle}
        </p>
      )}
      {wipDeposit && (
        <p className="text-black bg-green-500 p-2 pl-3 mt-2">
          <span className="ml-4">WIP Deposit Success :</span>
          <Link
            className="mr-3"
            rel="stylesheet"
            href={`https://aeneid.storyscan.xyz/tx/${wipDeposit}`}
          >
            <span className="text-blue-700 underline m-3">
              View on StoryScan
            </span>
          </Link>
        </p>
      )}
    </div>
  );
}
