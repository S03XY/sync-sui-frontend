"use client";

import "./globals.css";
import dynamic from "next/dynamic";
import { Poppins } from "next/font/google";
import { Wallet } from "@/Components/Common/WalletProvider";
const poppins = Poppins({ subsets: ["latin"], weight: "400" });
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { SocketProvider } from "@/Components/SocketProvider";
import { RTCPeerConnectionProvider } from "@/Components/RTCProvider";
import {
  WalletProvider,
  SuiWallet,
  SuietWallet,
  EthosWallet,
} from "@suiet/wallet-kit";

const DynamicToastProvider = dynamic(
  async () => {
    return await import("@/Components/Common/toast");
  },
  { ssr: false }
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="overflow-hidden">
      <body className={`${poppins.className} overflow-auto`}>
        <DynamicToastProvider>
          <SocketProvider>
            <RTCPeerConnectionProvider>
              <Provider store={store}>
                <WalletProvider
                  defaultWallets={[SuiWallet, SuietWallet, EthosWallet]}
                >
                  {children}
                </WalletProvider>
              </Provider>
            </RTCPeerConnectionProvider>
          </SocketProvider>
        </DynamicToastProvider>
      </body>
    </html>
  );
}
