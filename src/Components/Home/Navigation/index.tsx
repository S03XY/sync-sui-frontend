"use client";

import dynamic from "next/dynamic";
// import { useWallet } from "@solana/wallet-adapter-react";
import { ConnectButton, ErrorCode } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";
import { useEffect } from "react";
import { useWallet } from "@suiet/wallet-kit";
import { toast } from "react-toastify";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export const Navigation = () => {
  const wallet = useWallet();

  return (
    <div>
      <div className="flex justify-between items-center px-5 py-2">
        <div className=""></div>
        <div className="">
          <ConnectButton
            style={{ borderRadius: "5px" }}
            // onConnectError={(error) => {
            //   if (
            //     error.code === ErrorCode.WALLET__CONNECT_ERROR__USER_REJECTED
            //   ) {
            //     toast(
            //       "user rejected the connection to " + error.details?.wallet
            //     );
            //   } else {
            //     toast("unknown connect error: ");
            //   }
            // }}
          />
        </div>
        {/* <WalletMultiButtonDynamic>
          {!wallet.connected && `Connect Wallet`}
        </WalletMultiButtonDynamic> */}
      </div>
    </div>
  );
};
