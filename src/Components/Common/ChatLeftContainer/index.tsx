"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import DefaultProfilePicture from "@/assets/defaultProfilePic.svg";
import SearchIcon from "@/assets/whiteSearchIcon.svg";
import WaveHandWhite from "@/assets/waveHandWhite.svg";
import BackButtonWhite from "@/assets/backButtonWhite.svg";
import DropDownWhite from "@/assets/dropDownWhite.svg";
import WhiteInfoIcon from "@/assets/whiteInfo.svg";

// import { useWallet } from "@solana/wallet-adapter-react";
import { useWallet } from "@suiet/wallet-kit";
import { trimStringInMiddle } from "@/utils/stringUtils";
import { SearchBar } from "../SearchBar";
import WalletApiService from "@/apis/Wallet/WalletApiService";
import { isValidSolanaAddress, onDebounce } from "@/utils/common";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { toggleChatInterfaceTab } from "@/redux/reducers/chatReducer";
import { NotFoundRow } from "../NotFoundRow";
import { setCurrectActiveChat } from "@/redux/reducers/currentChat";
import { toast } from "react-toastify";

export const ChatLeftContainer = () => {
  // const [tab, setTab] = useState(0);
  const chatInterface = useAppSelector((state) => state.chartInterfaceReducer);

  return (
    <div className="h-full bg-[#202121] rounded-lg">
      {chatInterface.tab === 0 ? <Inbox /> : <NewChat />}
    </div>
  );
};

export const Inbox = () => {
  const [tab, setTab] = useState(0);
  const [chats, setChats] = useState([]);
  const wallet = useWallet();
  const currentUser = useAppSelector((state) => state.currentUser);

  useEffect(() => {
    if (wallet.connected && currentUser.userId) {
      WalletApiService.getContacts(currentUser.userId, false, 10)
        .then((res) => {
          setChats(res);
        })
        .catch(() => console.log);
    }
  }, [wallet, currentUser]);

  return (
    <div className="w-full h-full rounded-lg flex flex-col">
      <div className="h-[147px] w-full relative">
        <div className=" h-[147px] rounded-t-lg  absolute  bg-black/50 w-full">
          {/* <Image
          src={DefaultBackground}
          alt="banner"
          className="object-cover rounded-t-lg"
        /> */}
        </div>
        <div className="absolute flex justify-start p-4 items-end h-[147px]  w-full space-x-4">
          <div className="h-[60px] w-[60px] bg-[#202121] rounded-lg">
            {/* <Image
            src={DefaultProfilePicture}
            alt="default profile image"
            className="h-full w-full object-cover"
          /> */}
          </div>
          <div className="flex justify-start items-center space-x-2 bg-[#202121] py-2 px-4 rounded-lg">
            <div className="h-[32px] w-[32px]">
              <Image
                src={WaveHandWhite}
                alt="wave hand"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-[18px] font-medium">
              {`Hi, ${
                wallet.connected && wallet.connected ? currentUser.userId : ""
              }`}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-[#1A1A1A] flex justify-between items-center px-4 py-2">
        <div
          className={`cursor-pointer ${
            tab === 0 ? "text-[#0075FF]" : "text-white"
          }`}
          onClick={async () => {
            tab === 1 && setTab(0);
            const contacts = await WalletApiService.getContacts(
              currentUser.userId,
              false
            );

            setChats(contacts);
          }}
        >
          Chats
        </div>
        <div
          className={` cursor-pointer ${
            tab === 1 ? "text-[#0075FF]" : "text-white"
          } `}
          onClick={async () => {
            tab === 0 && setTab(1);
            const contacts = await WalletApiService.getContacts(
              currentUser.userId,
              true
            );

            setChats(contacts);
          }}
        >
          Request
        </div>
      </div>

      <SearchBar
        placeholder="Search for address or namespace"
        className="bg-[#3C3C3C] rounded-none space-x-2 p-4"
      />

      {chats.length > 0 ? (
        <div className="w-full flex flex-col justify-between items-center">
          {chats.map((d: any, i) => (
            <RowData
              key={i}
              walletAddress={
                tab === 0 ? d.receiver.walletAddress : d.sender.walletAddress
              }
              userId={tab === 0 ? d.receiver.userId : d.sender.userId}
            />
          ))}
        </div>
      ) : (
        <div className="h-3/4 w-full flex justify-center items-center">
          <div className="w-full   bg-[#1A1A1A] flex justify-center items-center p-4">
            No Chats
          </div>
        </div>
      )}
    </div>
  );
};

export const RowData = ({
  walletAddress,
  userId,
}: {
  walletAddress: string;
  userId: string;
}) => {
  // const activeChat = useAppSelector((state) => state.currentActiveChat);
  const dispatch = useAppDispatch();

  return (
    <div
      className="h-full w-full bg-[#1A1A1A] p-2 cursor-pointer flex justify-start items-center space-x-2"
      onClick={() => {
        dispatch(
          setCurrectActiveChat({
            remoteWalletAddress: walletAddress,
            userId: userId,
          })
        );
      }}
    >
      <div>
        <Image src={DefaultProfilePicture} alt="searchicon" />
      </div>
      <div className="flex flex-col w-full">
        <div className="flex justify-between items-center ">
          <div>{userId}</div>
          <div>18:17</div>
        </div>
        <div className="flex justify-between items-center ">
          <div>Hi there! Hows it going?</div>
          <div className="p-1 px-2 rounded-sm bg-[#0075FF] text-[14px]">1</div>
        </div>
      </div>
    </div>
  );
};

export const NewChat = () => {
  const [isNewChatDropdownOpen, setIsNewChatDropdownOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const [isInputPubkey, setIsInputPubkey] = useState(false);
  const [userInput, setUserInput] = useState<string>("");
  const [tab, setTab] = useState(0);
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector((state) => state.currentUser);

  const wallet = useWallet();

  const switchTab = (currentTab: number) => {
    switch (currentTab) {
      case 0:
        setTab(1);
        break;
      case 1:
        setTab(0);
        break;
      default:
        setTab(0);
    }
  };

  return (
    <div>
      <div className="p-4 cursor-pointer">
        <div
          onClick={() => {
            dispatch(toggleChatInterfaceTab({ tab: 0 }));
          }}
        >
          <Image src={BackButtonWhite} alt="searchicon" />
        </div>
      </div>
      <div>
        <div
          className="bg-black/50 flex justify-between items-center py-2 px-4 cursor-pointer"
          onClick={() => {
            setIsNewChatDropdownOpen(!isNewChatDropdownOpen);
          }}
        >
          <p>New Chat</p>
          <div className="cursor-pointer">
            <Image src={DropDownWhite} alt="dropdown" />
          </div>
        </div>

        {isNewChatDropdownOpen && (
          <div>
            <div className="flex justify-between items-center py-2 px-4">
              <div
                className={`cursor-pointer ${
                  tab === 0 ? "text-[#0075FF]" : "text-white"
                }`}
                onClick={() => {
                  switchTab(tab);
                }}
              >
                Search
              </div>
              <div
                className={`cursor-pointer ${
                  tab === 1 ? "text-[#0075FF]" : "text-white"
                }`}
                onClick={() => {
                  switchTab(tab);
                }}
              >
                Scan
              </div>
            </div>

            <SearchBar
              placeholder="Search for address or namespace"
              className="bg-[#3C3C3C] rounded-none space-x-2 p-4"
              onChange={async (e) => {
                setSearchResult([]);
                setIsInputPubkey(await isValidSolanaAddress(e.target.value));
                setUserInput(e.target.value);
                e.target.value &&
                  onDebounce(async () => {
                    const data = await WalletApiService.getWalletInfo(
                      e.target.value
                    );
                    setSearchResult(data);
                  });
              }}
            />

            {userInput ? (
              searchResult.length > 0 ? (
                searchResult.map(
                  (d: { walletAddress: string; userId: string }, i) => (
                    <ProfileRow
                      key={i}
                      newUser={false}
                      walletAddress={d.walletAddress}
                      userId={d.userId}
                      callback={async () => {
                        if (d.walletAddress === wallet.address) {
                          toast("Self message not allowed");
                          return;
                        }

                        dispatch(
                          setCurrectActiveChat({
                            remoteWalletAddress: d.walletAddress,
                            userId: d.userId,
                          })
                        );

                        const saveContactResponse =
                          await WalletApiService.requestChat(
                            currentUser.userId,
                            d.userId
                          );
                      }}
                    />
                  )
                )
              ) : isInputPubkey ? (
                <ProfileRow newUser={true} walletAddress={userInput} />
              ) : (
                <NotFoundRow text="No User Found" />
              )
            ) : null}
          </div>
        )}
      </div>
      <div className="bg-black/50 flex justify-between items-center py-2 px-4">
        <p>Saved Contacts</p>
        <div
          className="cursor-pointer"
          onClick={() => {
            setIsSearchDropdownOpen(!isSearchDropdownOpen);
          }}
        >
          <Image src={DropDownWhite} alt="dropdown" />
        </div>
      </div>

      {isSearchDropdownOpen && (
        <div>
          <SearchBar
            placeholder="Search for address or namespace"
            className="bg-[#3C3C3C] rounded-none space-x-2 p-4"
          />

          {/* {[1, 1, 1].map((d, i) => (
            <ProfileRow key={i} />
          ))} */}
        </div>
      )}
    </div>
  );
};

export const ProfileRow = ({
  newUser,
  walletAddress,
  userId,
  callback,
}: {
  newUser: boolean;
  walletAddress?: string;
  userId?: string;
  callback?: () => void;
}) => {
  return (
    <div
      className={`flex justify-between items-center p-2 bg-[#1A1A1A] ${
        !newUser && "cursor-pointer"
      }`}
      onClick={() => {
        callback && callback();
      }}
    >
      <div className="flex justify-center items-center space-x-2">
        <div>
          <Image
            src={DefaultProfilePicture}
            alt="profile picture"
            className="object-cover h-full w-full"
          />
        </div>

        {newUser ? (
          <div className="">
            <div>{trimStringInMiddle(walletAddress!, 4)}</div>
            <div className="text-white/50 text-[16px]">
              <button className="bg-[#0075FF] px-4 py-[2px] rounded-md text-white">
                Invite
              </button>
            </div>
          </div>
        ) : (
          <div className="">
            <div>{trimStringInMiddle(walletAddress!, 4)}</div>
            <div className="text-white/50 text-[16px]">{`@${userId}`}</div>
          </div>
        )}
      </div>
      {newUser && (
        <div className="mx-2 cursor-pointer">
          <Image src={WhiteInfoIcon} alt="info" />
        </div>
      )}
    </div>
  );
};
