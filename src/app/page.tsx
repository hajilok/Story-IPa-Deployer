import { ConnectButton } from "@rainbow-me/rainbowkit";
import TestComponent from "./components/wIP";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import { Poppins } from "next/font/google";
import GeneratedNFT from "./components/generatedNFT";

const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  return (
    <div>
      <div className="flex w-full fixed top-0 justify-between p-3  bg-[#D8B4F8] ">
        <h1 className={`text-4xl m-2 mt-3 ${poppins.className}`}>ChatBot</h1>

        <div className="mt-3">
          <ConnectButton />
        </div>
      </div>
      <div className="flex flex-col justify-center items-center mt-20 z-auto">
        <h1
          className={`text-5xl mb-3  text-center mr-2 mt-10 w-full ${poppins.className}`}
        >
          Welcome To Story Deploy IPA
        </h1>
        <p className={`text-base mt-3 ${poppins.className}`}>
          First You need To Wrap IP to wIP{" "}
        </p>
        <div className="gap-3 m-5">
          <TestComponent />
        </div>
        <div className={`gap-3 mt-5  ${poppins.className}`}>
          <GeneratedNFT />
        </div>
        <div className="flex flex-col justify-center h-20 rounded-lg ">
          <Link
            className="text-5xl mt-1 m-3"
            href="https://github.com/hajilok/Story-IPa-Deployer.git"
          >
            <FaGithub className="" />
          </Link>
        </div>
      </div>
    </div>
  );
}
