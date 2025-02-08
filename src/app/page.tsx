import { ConnectButton } from "@rainbow-me/rainbowkit";
import TestComponent from "./components/page";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  return (
    <div>
      <div className="flex w-full fixed top-0 justify-between p-3  border-gray-200 bg-purple-400">
        <h1 className={`text-4xl m-2 mt-3 ${poppins.className}`}>ChatBot</h1>

        <div className="mt-3">
          <ConnectButton />
        </div>
      </div>
      <div className="flex flex-col justify-center items-center mt-20">
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
        <div>
          <Link
            className="text-5xl mt-3 ml-1"
            href="https://github.com/hajilok/Story-IPa-Deployer.git"
          >
            <FaGithub />
          </Link>
        </div>
      </div>
    </div>
  );
}
