"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useEthersSigner } from "@/ethers-signer";
import abi from "@/abis/nft.json";
import { useAccount } from "wagmi";

const refunds = [
  {
    variant: 1,
    points: 2,
  },
  {
    variant: 2,
    points: 10,
  },
  {
    variant: 3,
    points: 30,
  },
  {
    variant: 4,
    points: 100,
  },
];

function NFT() {
  const account = useAccount();
  const signer = useEthersSigner();
  const [section, setSection] = useState("purchase");
  const [loadingForVariant, setLoadingForVariant] = useState([
    false,
    false,
    false,
    false,
  ]);
  const [loadingForBurningTokenId, setLoadingForBurningTokenId] = useState<
    number[]
  >([]);

  const [nfts, setNfts] = useState([
    {
      variant: 1,
      name: "NFT 1",
      price: "1",
    },
    {
      variant: 2,
      name: "NFT 2",
      price: "0.1",
    },
    {
      variant: 3,
      name: "NFT 3",
      price: "0.1",
    },
    {
      variant: 4,
      name: "NFT 4",
      price: "0.1",
    },
  ]);

  const [myNfts, setMyNfts] = useState<any>([]);

  useEffect(() => {
    if (signer) {
      fetchMyNfts();
    }
  }, [signer]);

  const fetchMyNfts = async () => {
    // As I have a helper function `getUserOwnedTokens(addr)` defined in the smart contract
    // So I can fetch the tokenIds of the NFTs owned by the user directly

    try {
      const contract = new ethers.Contract(
        "0x052c8eB7a8aDD3bA33a1A85F99464CdA88633FaC",
        abi,
        signer
      );

      if (signer) {
        const tokenIds = await contract.getUserOwnedTokens(signer.getAddress());

        // fetch variant of each token
        const variants = await Promise.all(
          tokenIds.map((id: number) => contract.tokenVariants(id))
        );

        // map tokenIds to variant
        const nfts = tokenIds.map((id: number, index: number) => ({
          tokenId: Number(id),
          variant: Number(variants[index]),
        }));

        setMyNfts(nfts);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const mint = async (variant: number) => {
    try {
      const contract = new ethers.Contract(
        "0x052c8eB7a8aDD3bA33a1A85F99464CdA88633FaC",
        abi,
        signer
      );

      if (signer) {
        setLoadingForVariant((prev) => prev.map((_, i) => i === variant - 1));

        // mintNFT1, mintNFT2, mintNFT3, mintNFT4 are the available functions in the smart contract
        const tx = await contract[`mintNFT${variant}`]();

        await tx.wait();
        fetchMyNfts();
      }
    } catch (e) {
      console.error(e);
    } finally {
      // reset loading state
      const newLoading = [...loadingForVariant];
      newLoading[variant - 1] = false;
      setLoadingForVariant(newLoading);
    }
  };
  const randomMint = async () => {
    try {
      const contract = new ethers.Contract(
        "0x052c8eB7a8aDD3bA33a1A85F99464CdA88633FaC",
        abi,
        signer
      );

      if (signer) {
        const tx = await contract.randomMint();

        await tx.wait();
        fetchMyNfts();
      }
    } catch (e) {
      console.error(e);
    } finally {
      // reset loading state
      // const newLoading = [...loadingForVariant];
      // newLoading[variant - 1] = false;
      // setLoadingForVariant(newLoading);
    }
  };
  const burn = async (tokenId: number) => {
    try {
      const contract = new ethers.Contract(
        "0x052c8eB7a8aDD3bA33a1A85F99464CdA88633FaC",
        abi,
        signer
      );

      if (signer) {
        setLoadingForBurningTokenId((prev) => [...prev, tokenId]);

        // burn(tokenId) is the available function in the smart contract
        const tx = await contract.burn(tokenId);

        await tx.wait();
        fetchMyNfts();
      }
    } catch (e) {
      console.error(e);
    } finally {
      // reset loading state
      setLoadingForBurningTokenId((prev) =>
        prev.filter((id) => id !== tokenId)
      );
    }
  };

  return (
    <>
      <Header />
      <h2 className="text-center text-3xl font-bold my-12">NFT</h2>

      <div className="flex max-w-5xl mx-auto">
        <div className="flex-1 flex items-center">
          <h4 className="text-3xl mb-4">
            Purchase a Mystery NFT which could be any one of the Polymer Phase 2
            NFT Types
          </h4>
        </div>
        <div className="flex-1 py-48 text-center bg-slate-200">[Image]</div>
      </div>

      <ul className="flex justify-center gap-x-8 mt-12">
        <li>
          <button
            className={`text-black font-bold py-1 border-b-4
          ${section === "purchase" ? "border-black" : ""}`}
            onClick={() => setSection("purchase")}
          >
            Purchase NFT
          </button>
        </li>
        <li>
          <button
            className={`text-black font-bold py-1 border-b-4
          ${section === "my-nfts" ? "border-black" : ""}`}
            onClick={() => setSection("my-nfts")}
          >
            My NFTs
          </button>
        </li>
      </ul>

      <div className="my-12 max-w-5xl mx-auto mb-24">
        <ul className={`grid grid-cols-4 gap-4 nfts visible-${section}`}>
          {nfts.map((nft) => (
            <li key={nft.name} className="nft-mint">
              <div className="w-full nft-card text-3xl bg-slate-800 text-white flex justify-center items-center rounded">
                {nft.name}
              </div>
              <div className="flex mt-2">
                <div className="flex-1">
                  <h5>{nft.name}</h5>
                  <p className="text-sm">{nft.price} ETH</p>
                </div>
                <div>
                  <button
                    className="bg-black text-white text-center px-4 py-2 rounded-lg hover:scale-105 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    type="button"
                    disabled={
                      loadingForVariant[nft.variant - 1] ||
                      account.status !== "connected"
                    }
                    onClick={() => mint(nft.variant)}
                  >
                    {loadingForVariant[nft.variant - 1] ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      "Mint"
                    )}
                  </button>
                </div>
              </div>
            </li>
          ))}
          {myNfts.map((nft: any, index: number) => (
            <li key={index} className="nft-own">
              <div className="w-full nft-card text-3xl bg-slate-800 text-white flex justify-center items-center rounded">
                NFT {nft.variant}
              </div>
              <div className="flex mt-2">
                <div className="flex-1">
                  <h5>NFT #{nft.tokenId}</h5>
                  <p className="text-sm">
                    Get {refunds.find((r) => r.variant === nft.variant)?.points}{" "}
                    points points
                  </p>
                </div>
                <div>
                  <button
                    className="bg-black text-white text-center px-4 py-2 rounded-lg hover:scale-105 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    type="button"
                    disabled={
                      loadingForBurningTokenId.includes(nft.tokenId) ||
                      account.status !== "connected"
                    }
                    onClick={() => burn(nft.tokenId)}
                  >
                    {loadingForBurningTokenId.includes(nft.tokenId) ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      "Burn"
                    )}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="text-center my-24 bg-slate-100 p-12 rounded">
          <h5 className="text-xl mb-4">
            Feeling lucky? Try a Randomizer @ 0.0002 ETH
          </h5>
          <button
            className="bg-black text-white text-center px-4 py-2 rounded-lg hover:scale-105 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            type="button"
            disabled={account.status !== "connected"}
            onClick={() => randomMint()}
          >
            Randomize
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default NFT;
