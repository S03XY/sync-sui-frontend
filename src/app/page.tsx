"use client";

import Image from "next/image";
import LoginBG from "@/assets/login bg png.png";
import { Navigation } from "@/Components/Home/Navigation";
import Logo from "@/assets/xblendLogo.svg";
import SolanaColorLogo from "@/assets/solanaColorLogo.svg";
import { SizableButton } from "@/Components/Common/Button";
import { useEffect, useState } from "react";
import { useRouter, redirect } from "next/navigation";
import WalletApiService from "@/apis/Wallet/WalletApiService";
// import { useWallet } from "@solana/wallet-adapter-react";
import { useWallet } from "@suiet/wallet-kit";
import { useAppDispatch } from "@/redux/hooks";
import { updateActiveUser } from "@/redux/reducers/currentUser";
import { useSocket } from "@/Components/SocketProvider";
import { toast } from "react-toastify";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [isWalletRegistered, setIsWalletRegistered] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const wallet = useWallet();
  const socket = useSocket();

  useEffect(() => {
    if (wallet.connected) {
      WalletApiService.isWalletRegistered(wallet.address!)
        .then((d) => {
          d.userId ? setIsWalletRegistered(true) : setIsWalletRegistered(false);
          if (d.userId) {
            socket?.emit("userOnline", {
              userId: d.userId,
              walletAddress: d.walletAddress,
            });
            router.push("/chat");
            dispatch(
              /**
               * TODO  Dont need to store the wallet address in the redux
               */
              updateActiveUser({
                walletAddress: d.walletAddress,
                userId: d.userId,
              })
            );
          } else {
            // setLoading(false);
          }
        })
        .catch(() => {
          // setLoading(false);
        });
    } else {
      // setLoading(false);
    }
  }, [wallet, router, dispatch]);

  async function handleSignMsg() {
    if (!wallet.account) return false;
    try {
      const msg = "Welcome to Sync";
      const msgBytes = new TextEncoder().encode(msg);
      const result = await wallet.signMessage({
        message: msgBytes,
      });

      console.log("result", result);
      return true;
    } catch (e) {
      console.error("signMessage failed", e);
      toast("signMessage failed (see response in the console)");
      return false;
    }
  }

  return (
    <main>
      {loading ? (
        <div>Loading</div>
      ) : (
        <div className="h-[100vh] w-full fixed">
          <Image
            src={LoginBG}
            alt="background image"
            className="object-cover absolute"
          />{" "}
          <div className="bg-black h-[100vh] w-full absolute bg-opacity-50 flex flex-col">
            <Navigation />
            <div className="w-full h-full flex flex-col justify-center items-center">
              <div className="flex justify-center items-center space-x-4">
                <div className="h-[64px] w-[64px] flex justify-center items-center">
                  <Image src={Logo} alt="logo" />
                </div>
                <p className="text-[64px] font-bold">Sync</p>
              </div>
              <div className=" flex justify-between items-center flex-col space-y-4">
                <div className="text-[24px]">
                  The easiest way to connect, collect, create, and exchange your
                  values on sui
                </div>
                {wallet.connected && isWalletRegistered === false && (
                  <div className="flex justify-between items-center w-full space-x-4">
                    <div className="w-full flex justify-center items-center bg-white/10 rounded-lg">
                      <input
                        type="text"
                        className="w-full text-[18px] py-5 rounded-lg  px-5 bg-transparent focus:outline-none font-medium"
                        placeholder="Pick a unique sync namespace"
                        value={userInput}
                        onChange={(e) => {
                          e.target.value
                            ? setUserInput(e.target.value)
                            : setUserInput("");
                        }}
                      />
                      <div className="mr-5 text-[18px] font-medium">.sync</div>
                    </div>
                    <SizableButton
                      text={"Register Wallet"}
                      onclick={async () => {
                        const signResult = await handleSignMsg();
                        if (!signResult) {
                          return;
                        }

                        if (wallet.address) {
                          WalletApiService.registerNewWallet(
                            wallet.address,
                            userInput
                          )
                            .then(() => {
                              socket?.emit("userOnline", {
                                userId: `${userInput}.sync`,
                                walletAddress: wallet.address,
                              });
                              router.push("/chat");
                              dispatch(
                                updateActiveUser({
                                  walletAddress: wallet.address,
                                  userId: `${userInput}.sync`,
                                })
                              );
                            })
                            .catch(() => {});
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="self-end m-4 flex justify-center items-center space-x-2">
              <div className="h-[18px] w-[20.55px] opacity-25">
                <Image
                  src={SolanaColorLogo}
                  alt="solana logo"
                  className="object-cover"
                />
              </div>
              <div className="text-[18px] font-medium opacity-25">
                Build on sui
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
