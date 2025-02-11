"use client";
import { useState, useEffect } from "react";
import { custom } from "viem";
import { useWalletClient } from "wagmi";
import { StoryClient, StoryConfig, IpMetadata } from "@story-protocol/core-sdk";
import { createHash } from "crypto";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import uploadImage from "../handleFile/imageKit";
import { uploadJson } from "../handleFile/pinata";
import Link from "next/link";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const GeneratedNFT = () => {
  const { data: wallet } = useWalletClient();
  const [image, setImage] = useState<string | null>(null);
  const [metadaimage, setMetadaimage] = useState<string>("");
  const [nftContract, setNftContract] = useState({
    txHash: "",
    contractAddress: "",
    IPA: "",
  });
  const [inputData, setInputData] = useState({
    nameiPA: "",
    Symbol: "",
    Author: "",
    Wallet: "",
    Description: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errors, setErrors] = useState<{
    nameiPA?: string;
    Symbol?: string;
    Author?: string;
    Wallet?: string;
    Description?: string;
  }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (wallet?.account.address) {
      setInputData((prev) => ({
        ...prev,
        Wallet: wallet.account.address,
      }));
    }
  }, [wallet]);

  async function setupStoryClient(): Promise<StoryClient> {
    const config: StoryConfig = {
      account: wallet!.account,
      transport: custom(wallet!.transport),
      chainId: "aeneid",
    };
    const client = StoryClient.newClient(config);
    return client;
  }

  const validateInputs = (): boolean => {
    const newErrors: {
      nameiPA?: string;
      Symbol?: string;
      Author?: string;
      Wallet?: string;
      Description?: string;
    } = {};

    if (!inputData.nameiPA.trim()) newErrors.nameiPA = "Name iPA is required";
    if (!inputData.Symbol.trim()) newErrors.Symbol = "Symbol is required";
    if (!inputData.Author.trim()) newErrors.Author = "Author is required";
    if (!inputData.Description.trim())
      newErrors.Description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJsonConvert = async () => {
    if (!validateInputs()) return; // Stop jika ada error
    console.log("Input data Wallet:", inputData.Wallet);
    setIsLoading(true);
    try {
      const nftMetada = JSON.stringify({
        name: inputData.nameiPA,
        description: inputData.Description,
        image: metadaimage,
      });

      const uploadMetadataNft = await uploadJson(JSON.parse(nftMetada));

      const client = await setupStoryClient();
      const GeneratedNFT = await client?.nftClient.createNFTCollection({
        name: inputData.nameiPA,
        symbol: inputData.Symbol,
        isPublicMinting: true,
        mintOpen: true,
        mintFeeRecipient: `0x${inputData.Wallet.replace(/^0x/, "")}`,
        contractURI: `htpps://${process.env.NEXT_PUBLIC_PINATA_URL}/ipfs/${uploadMetadataNft.IpfsHash}`,
        txOptions: { waitForTransaction: true },
      });

      const ipMetadata: IpMetadata = client.ipAsset.generateIpMetadata({
        title: inputData.nameiPA,
        description: inputData.Description,
        watermarkImg: metadaimage,
        attributes: [
          {
            key: "Rarity",
            value: "Legendary",
          },
        ],
        creators: [
          {
            name: inputData.Author,
            address: `0x${inputData.Wallet.replace(/^0x/, "")}`,
            contributionPercent: 100,
          },
        ],
      });

      const uploadMetadataIPA = await uploadJson(ipMetadata);
      const metadataNftHash = createHash("sha256")
        .update(JSON.stringify(uploadMetadataNft))
        .digest("hex");
      const metadataIpaHash = createHash("sha256")
        .update(JSON.stringify(uploadMetadataIPA))
        .digest("hex");

      if (GeneratedNFT?.spgNftContract) {
        try {
          const createIpa = await client.ipAsset.mintAndRegisterIp({
            spgNftContract: `0x${GeneratedNFT.spgNftContract.replace(
              /^0x/,
              ""
            )}`,
            allowDuplicates: true,
            ipMetadata: {
              ipMetadataURI: `https://ipfs.io/ipfs/${uploadMetadataIPA.IpfsHash}`,
              ipMetadataHash: `0x${metadataIpaHash}`,
              nftMetadataURI: `https://ipfs.io/ipfs/${uploadMetadataNft.IpfsHash}`,
              nftMetadataHash: `0x${metadataNftHash}`,
            },
            txOptions: { waitForTransaction: true },
          });
          setNftContract({
            txHash: createIpa.txHash || "",
            contractAddress: GeneratedNFT?.spgNftContract || "",
            IPA: createIpa?.ipId
              ? `0x${createIpa?.ipId.replace(/^0x/, "")}`
              : "",
          });
        } catch (error) {
          console.error("Error:", error);
        }
      } else {
        throw new Error("GeneratedNFT.spgNftContract is undefined");
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file: File | null = event.target.files ? event.target.files[0] : null;
    if (!file) return;

    console.log("File selected:", file);
    const reader: FileReader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    const upload = await uploadImage(file);
    setMetadaimage(upload as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center justify-center mr-1 p-4">
      <Card className="w-full max-w-md p-4 shadow-lg mr-3">
        <CardContent className="flex flex-col items-center">
          {image ? (
            <div className="flex flex-col items-center">
              <Image
                src={image || "/placeholder.png"}
                alt="Uploaded"
                className="mt-4 w-1/2 h-auto rounded-lg shadow-md"
                width={100}
                height={100}
              />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="mt-5"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    Submit IPA
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Submit Your Detail</DialogTitle>
                    <DialogDescription>
                      Submit Your Detail Name iPA , author and Wallet for
                      Royalty.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name iPA
                      </Label>
                      <Input
                        id="name"
                        className={`col-span-3 ${
                          errors.nameiPA ? "border-red-500" : "border-gray-300"
                        }`}
                        required={true}
                        onChange={(e) =>
                          setInputData({
                            ...inputData,
                            nameiPA: e.target.value,
                          })
                        }
                      />
                      {errors.nameiPA && (
                        <p className="text-red-500 col-span-4 text-sm">
                          {errors.nameiPA}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="Symbol" className="text-right">
                        Symbol
                      </Label>
                      <Input
                        id="Symbol"
                        className="col-span-3"
                        onChange={(e) =>
                          setInputData({
                            ...inputData,
                            Symbol: e.target.value,
                          })
                        }
                      />
                      {errors.Symbol && (
                        <p className="text-red-500 col-span-4 text-sm font-light">
                          {errors.Symbol}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="Author" className="text-right">
                        Author
                      </Label>
                      <Input
                        id="Author"
                        className="col-span-3"
                        required={true}
                        onChange={(e) =>
                          setInputData({
                            ...inputData,
                            Author: e.target.value,
                          })
                        }
                      />
                      {errors.Author && (
                        <p className="text-red-500 col-span-4 text-sm">
                          {errors.Author}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="Wallet" className="text-right">
                        Wallet
                      </Label>
                      <Input
                        id="Wallet"
                        className="col-span-3"
                        required={true}
                        defaultValue={wallet?.account.address || ""}
                        onChange={(e) =>
                          setInputData((prev) => ({
                            ...prev,
                            Wallet: e.target.value, // Pastikan value selalu diperbarui
                          }))
                        }
                      />
                      {errors.Wallet && (
                        <p className="text-red-500 col-span-4">
                          {errors.Wallet}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="Description" className="text-right">
                        Description
                      </Label>
                      <Input
                        id="Description"
                        className="col-span-3"
                        required={true}
                        onChange={(e) =>
                          setInputData({
                            ...inputData,
                            Description: e.target.value,
                          })
                        }
                      />
                      {errors.Description && (
                        <p className="text-red-500 col-span-4">
                          {errors.Description}
                        </p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      onClick={handleJsonConvert}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 mr-2"
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
                              d="M4 12a8 8 0 018-8v4l3.5-3.5L12 4v4a8 8 0 01-8 8z"
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        "Save changes"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <p className={`mt-4 mb-3 ml-3 ${poppins.className}`}>
                After wrap IP to wIP
              </p>
              <p className={`mt-4 mb-3 ml-3 ${poppins.className}`}>
                You can Create IPA
              </p>
              <p className={`mt-4 mb-3 ml-3 ${poppins.className}`}>
                With Upload Image
              </p>
              <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 ml-3 ">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
          {metadaimage && (
            <div className="mt-4 flex justify-center items-center gap-2 bg-slate-800 rounded p-2 ">
              <Link
                href={metadaimage}
                className=" mb-1"
                rel="stylesheet"
                target="_blank"
              >
                <p
                  className={`text-sm text-gray-400 font-bold hover:text-blue-200 mt-2 ${poppins.className}`}
                >
                  Metadata image
                </p>
              </Link>
            </div>
          )}
          {nftContract.txHash && (
            <div
              className={`flex flex-col justify-start w-full bg-slate-800 rounded-xl pt-3 pb-1 mt-3 text-sm font-light ${poppins.className}`}
            >
              <p className="text-gray-500 ml-6 mb-1 text-base font-bold">
                Detail IPA :
              </p>
              <Card className=" flex flex-col w-full  border border-gray-300 rounded-xl shadow-lg mr-1">
                <CardContent className="mt-2 mr-12 w-full">
                  <div className="flex items-start gap-2">
                    <p className="  mt-2 text-base font-bold">Txhash IPA :</p>
                    <Link
                      href={`https://aeneid.storyscan.xyz/tx/${nftContract.txHash}`}
                      className="mr-3 pt-2 gap-1 mb-1 mt-auto "
                      rel="stylesheet"
                      target="_blank"
                    >
                      <span className="text-base  text-black hover:text-blue-500 hover:underline">
                        View On aeneid Scan
                      </span>
                    </Link>
                  </div>
                  <div className="flex justify-between w-full gap-2">
                    <p className=" mt-1">
                      <span className="text-base font-bold">Nft Address :</span>
                      <span className="text-sm items-center">
                        <Link
                          href={`https://aeneid.storyscan.xyz/address/${nftContract.contractAddress}`}
                          className="ml-2"
                          target="_blank"
                        >
                          <span className=" text-black hover:text-blue-500 hover:underline">
                            {nftContract.contractAddress.slice(0, 10)}...
                            {nftContract.contractAddress.slice(30, 42)}
                          </span>
                        </Link>
                      </span>
                    </p>
                  </div>
                  {nftContract.IPA && (
                    <p className=" flex justify-between w-full mt-1">
                      <span className="text-base font-bold ">IPA Address</span>
                      <span className="text-sm text-gray-500 items-center mt-1">
                        <Link
                          href={`https://explorer.story.foundation/ipa/${nftContract.IPA}`}
                          className="mr-6 "
                          target="_blank"
                        >
                          <span className=" text-black   hover:text-blue-500 hover:underline ">
                            {nftContract.IPA.slice(0, 10)}...
                            {nftContract.IPA.slice(30, 42)}
                          </span>
                        </Link>
                      </span>
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneratedNFT;
