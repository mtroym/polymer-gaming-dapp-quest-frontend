"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useEthersSigner } from "@/ethers-signer";
import abi from "@/abis/points.json";
import { useAccount } from "wagmi";

function Points() {
  const account = useAccount();
  const signer = useEthersSigner();

  // when the user clicks the "Spin Wheel" button, isRequesting will be set to true
  // and the button will be disabled
  // once the request is complete, isRequesting will be set to false
  const [isRequesting, setIsRequesting] = useState(false);

  // as the points received will be determined by the smart contract, we will need to
  // wait for the transaction to be mined before we can display the result
  // on the spin wheel
  const [points, setPoints] = useState<null | number>(0);

  // this is the dummy smart contract that I have deployed to optimism sepolia:
  // 0xE97994805b7a090d7D1222c2bd4C8D7e0799ef93
  // https://sepolia-optimism.etherscan.io/address/0xE97994805b7a090d7D1222c2bd4C8D7e0799ef93#code
  // it contains two functions:
  // function requestPoints() public returns (uint256)
  // - which generate points between 1 to 10
  // function deductPoints(uint256 points) public
  // - a dummy function that deducts points from the user
  // and emits an event when the points get added or deducted
  // - event PointsAdded(address indexed user, uint256 indexed points)
  // - event PointsDeducted(address indexed user, uint256 indexed points)

  const spinWheel = async () => {
    // init contract with the address of the deployed contract
    try {
      const contract = new ethers.Contract(
        "0xda9996d80EFdaE2C30B3036C47E2A5617F8BA8Ca",
        abi,
        signer
      );
      // 0xda9996d80EFdaE2C30B3036C47E2A5617F8BA8Ca
      // listen to the event emitted by the contract
      contract.on("PointsAdded", (addr, randomNumber) => {
        if (addr === signer?.address) {
          setPoints(Number(randomNumber));
          setIsRequesting(false);
        }
      });

      setIsRequesting(true);
      const tx = await contract.funMint();
      await tx.wait();
    } catch (e) {
      console.error(e);
      setIsRequesting(false);
      setPoints(0);
    }
  };

  return (
    <>
      <Header />
      <h2 className="text-center text-3xl font-bold my-12">Points</h2>
      <div className="flex justify-center items-center max-w-5xl mx-auto">
        <div className="flex-1 p-4">
          <h4 className="text-3xl">Polymer Points Faucet Wheel</h4>
          <p className="mt-4">
            Spin the wheel every 5 minutes to get Polymer Points, which can be
            used to purchase Polymer Phase 2 NFTs!
          </p>
        </div>
        <div className="flex-1 p-4 flex flex-col justify-center items-center">
          <div className="mb-8 relative">
            <span className="text-3xl absolute left-[50%] z-10 -top-[36px] -ml-[18px]">
              ⬇️
            </span>
            <img
              src="/assets/spinwheel.svg"
              alt="spin wheel"
              className={`w-96 ${
                isRequesting ? "spinwheel-spin" : `spinwheel-${points}`
              }`}
            />
          </div>
          {/* {points !== null && <p>Points Added: {points}</p>} */}

          {account.status === "connected" ? (
            <button
              className="bg-black text-white text-center px-4 py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              type="button"
              onClick={spinWheel}
              disabled={isRequesting}
            >
              {isRequesting ? "Spinning..." : "Spin Wheel"}
            </button>
          ) : (
            <p className="text-red-500">
              Please connect your wallet to spin the wheel
            </p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Points;
