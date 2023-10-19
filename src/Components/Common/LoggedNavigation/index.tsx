import dynamic from "next/dynamic";
import Logo from "@/assets/xblendLogo.svg";
import Image from "next/image";
import { SearchBar } from "../SearchBar";
import { ConnectButton } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export const LoggedNavigation = () => {
  return (
    <div className="flex justify-between item-center ">
      <SearchBar />
      <div className="flex justify-center items-center space-x-2">
        <div className="h-[64px] w-[64px] flex justify-center items-center">
          <Image src={Logo} alt="logo" className="object-cover" />
        </div>
        {/* <WalletMultiButtonDynamic /> */}
        <ConnectButton />
      </div>
    </div>
  );
};
