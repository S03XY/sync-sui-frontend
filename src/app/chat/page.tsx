"use client";

import NewChatWhite from "@/assets/newChat.svg";
import DefaultProfile from "@/assets/defaultProfilePic.svg";
import NewPhoneCallWhite from "@/assets/newPhonecallWhite.svg";
import NewVideoCallWhite from "@/assets/newVideoCallWhite.svg";
import MoreOptionsWhite from "@/assets/moreOptionsWhite.svg";
import UploadWhite from "@/assets/uploadWhite.svg";
import MessageWhite from "@/assets/sendMessageWhite.svg";

import { ChatLeftContainer } from "@/Components/Common/ChatLeftContainer";
import { LoggedNavigation } from "@/Components/Common/LoggedNavigation";
import { SideNavigation } from "@/Components/Common/SideNavigation";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { toggleChatInterfaceTab } from "@/redux/reducers/chatReducer";
import { trimStringInMiddle } from "@/utils/stringUtils";
import { useSocket } from "@/Components/SocketProvider";
import { useEffect, useState } from "react";
import WalletApiService from "@/apis/Wallet/WalletApiService";
import { onDebounce } from "@/utils/common";
import { ChatBox, MessageStatus } from "@/Components/Common/chatbox";
import { PhoneCallUI } from "@/Components/Common/PhoneCall";
import {
  PhoneCallType,
  changePhonecallUIType,
  setCallerDetails,
  setIsAudiocall,
  setMediaStream,
  togglePhoneCallUI,
} from "@/redux/reducers/phoneCallUI";
import { useGetRTCPeerConnection } from "@/Components/RTCProvider";
import { toast } from "react-toastify";
import { useWallet } from "@suiet/wallet-kit";

interface IChatPayload {
  message: string;
  receiverSocketId: string;
  receiverUserId: string;
  senderUserId: string;
}

const ChatPage = () => {
  const [receiverSocketId, setReceiverSocketId] = useState<string>("");
  const dispatch = useAppDispatch();
  const currentActiveChat = useAppSelector((state) => state.currentActiveChat);
  const currentActiveUser = useAppSelector((state) => state.currentUser);
  const socket = useSocket();
  const [TypingState, setTypingState] = useState<string>("Online");
  const [message, setMessage] = useState<string>(""); // TODO need to create a sperate draft storage for everychat
  const [chats, setChats] = useState<[IChatPayload]>();
  // const wallet = useWallet();

  const rtcPeerConnection = useGetRTCPeerConnection()?.rtcPeerConnection;
  const setRTCPeerConnection = useGetRTCPeerConnection()?.setRTCPeerConnection;

  const phoneCallInterface = useAppSelector(
    (state) => state.phoneCallInterface
  );

 

  useEffect(() => {
    socket?.on("accept-offer", (payload) => {
      if (currentActiveUser.userId === payload.receiverUserId) {
        dispatch(changePhonecallUIType({ type: PhoneCallType.INCOMING }));
        dispatch(togglePhoneCallUI({ isOpen: true }));
        dispatch(
          setCallerDetails({
            senderWalletAddress: payload.senderWalletAddress,
            senderUserId: payload.senderUserId,
            offer: payload.offer,
            senderSocketId: payload.senderSocketId,
          })
        );
        dispatch(setIsAudiocall({ audiocall: payload.isAudiocall }));
      }
    });
    return () => {
      socket?.off("accept-offer");
    };
  }, [socket, currentActiveUser.userId, dispatch, phoneCallInterface]);

  useEffect(() => {
    if (currentActiveChat.userId) {
      WalletApiService.getWalletInfo(currentActiveChat.userId)
        .then((res) => {
          setReceiverSocketId(res[0].socketId);
        })
        .catch((err) => {});
    }
  }, [currentActiveChat]);

  useEffect(() => {
    socket?.on("UserTyping", () => {
      setTypingState("Typing...");
      onDebounce(() => {
        setTypingState("Online");
      });
    });
    return () => {
      socket?.off("UserTyping");
    };
  }, [socket]);

  useEffect(() => {
    socket?.on("receive-message", (payload: IChatPayload) => {
      pushToChat(payload, chats);
    });
    return () => {
      socket?.off("receive-message");
    };
  }, [socket, chats]);

  const pushToChat = (
    payload: IChatPayload,
    chats: [IChatPayload] | undefined
  ) => {
    if (chats) {
      const oldChats = chats;
      oldChats.push(payload);
      setChats([...oldChats]);
    } else {
      setChats([payload]);
    }
  };

  const makeCall = async ({
    audio,
    video,
    isAudiocall,
  }: {
    audio: boolean;
    video: boolean;
    isAudiocall: boolean;
  }) => {
    !phoneCallInterface.isOpen && dispatch(togglePhoneCallUI({ isOpen: true }));

    try {
      const media = await window.navigator.mediaDevices.getUserMedia({
        audio,
        video: video
          ? { height: { ideal: 1280 }, width: { ideal: 720 } }
          : false,
      });
      dispatch(setMediaStream({ mediaStream: media }));
      rtcPeerConnection?.addEventListener("icecandidate", async (e) => {
        if (e.candidate !== null) {
          socket?.emit("sender-ice-candidate-directly", {
            receiverSocketId: receiverSocketId,
            candidate: e.candidate,
            receiverUserId: currentActiveChat.userId,
            senderUserId: currentActiveUser.userId,
          });
        }
      });
      media.getTracks().forEach((track) => {
        rtcPeerConnection?.addTrack(track, media);
      });
    } catch (error) {
      toast("Please allow microphone access to enable calling");
      return;
    }

    dispatch(
      changePhonecallUIType({
        type: PhoneCallType.OUTGOING,
      })
    );

    const offer = await rtcPeerConnection?.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    rtcPeerConnection?.setLocalDescription(new RTCSessionDescription(offer!));

    socket?.emit("create-offer", {
      senderWalletAddress: currentActiveUser.walletAddress,
      receiverSocketId,
      receiverUserId: currentActiveChat.userId,
      senderUserId: currentActiveUser.userId,
      offer: offer,
      isAudiocall: isAudiocall,
    });
  };

  useEffect(() => {
    socket?.on("disconnectCall", async () => {
      await hangUp();
      setRTCPeerConnection!(false);
    });

    const hangUp = async () => {
      const senders = rtcPeerConnection?.getSenders();
      senders?.forEach((sender) => {
        const track = sender.track;
        if (track) {
          track.stop();
        }
      });

      phoneCallInterface.mediaStream?.getTracks().forEach((t) => {
        t.stop();
      });
      rtcPeerConnection?.close();
      dispatch(setMediaStream({ mediaStream: undefined }));
      dispatch(togglePhoneCallUI({ isOpen: false }));
    };

    return () => {
      socket?.off("disconnectCall");
    };
  }, [socket, rtcPeerConnection, phoneCallInterface.mediaStream, dispatch]);

  return (
    <div className="grid grid-cols-[1fr,3fr] h-[100vh]">
      <div className="h-full w-full p-4">
        <ChatLeftContainer />
      </div>
      <div className="h-full w-full p-4 flex flex-col">
        <LoggedNavigation />
        <div className="mt-5 h-full w-full flex justify-between space-x-4">
          <div className="h-full w-full bg-[#202121] rounded-lg grid grid-rows-[1fr,8fr,1fr]">
            {currentActiveChat.remoteWalletAddress && (
              <>
                <div className=" p-2 flex justify-between items-center">
                  <div className="flex justify-start items-center space-x-2">
                    <div>
                      <Image src={DefaultProfile} alt="profile" />
                    </div>
                    <div>
                      <div className="flex justify-start items-center space-x-2">
                        <p className="text-[18px] font-medium">
                          {trimStringInMiddle(
                            currentActiveChat.remoteWalletAddress,
                            4
                          )}
                        </p>
                        <p className="text-[14px] font-medium text-white/50">
                          {`@${currentActiveChat.userId}`}
                        </p>
                      </div>
                      <span className="text-white/50">{TypingState}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center space-x-4">
                    <div
                      className="p-2 bg-[#1A1A1A] rounded-lg cursor-pointer"
                      onClick={async () => {
                        dispatch(setIsAudiocall({ audiocall: true }));
                        await makeCall({
                          audio: true,
                          video: false,
                          isAudiocall: true,
                        });
                      }}
                    >
                      <Image
                        src={NewPhoneCallWhite}
                        alt="audio call"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div
                      className="p-2 bg-[#1A1A1A] rounded-lg cursor-pointer"
                      onClick={async () => {
                        dispatch(setIsAudiocall({ audiocall: false }));
                        await makeCall({
                          audio: false,
                          video: true,
                          isAudiocall: false,
                        });
                      }}
                    >
                      <Image
                        src={NewVideoCallWhite}
                        alt="video call"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-2 bg-[#1A1A1A] rounded-lg cursor-pointer">
                      <Image
                        src={MoreOptionsWhite}
                        alt="options"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="overflow-y-scroll max-h-[70vh] py-2 px-4">
                  {chats && chats?.length > 0 ? (
                    chats.map((d, i) => (
                      <ChatBox
                        isReceiver={
                          d.receiverUserId === currentActiveChat.userId
                            ? true
                            : false
                        }
                        message={d.message}
                        date={new Date().toString()}
                        status={MessageStatus.OPENED}
                        key={i}
                      />
                    ))
                  ) : (
                    <div></div>
                  )}
                </div>
                <div className="flex justify-start items-center px-2 py-2 space-x-4">
                  <div className="bg-[#0075FF] rounded-lg h-full flex justify-center items-center">
                    <Image src={UploadWhite} alt="upload" className="mx-5" />
                  </div>

                  <div className="w-full bg-[#3B3B3B] rounded-lg h-full">
                    <input
                      type="text"
                      placeholder="New Message"
                      className="h-full w-full p-3 bg-transparent"
                      value={message}
                      onChange={(e) => {
                        socket?.emit("Typing", {
                          userId: currentActiveUser.userId,
                          receiverSocketId: receiverSocketId,
                        });

                        e.target.value
                          ? setMessage(e.target.value)
                          : setMessage("");
                      }}
                    />
                  </div>
                  <div
                    className="bg-[#0075FF] rounded-lg h-full flex justify-center items-center cursor-pointer hover:bg-black"
                    onClick={() => {
                      const payload: {
                        message: string;
                        receiverSocketId: string;
                        receiverUserId: string;
                        senderUserId: string;
                      } = {
                        message: message,
                        receiverSocketId: receiverSocketId,
                        receiverUserId: currentActiveChat.userId,
                        senderUserId: currentActiveUser.userId,
                      };
                      setMessage("");
                      socket?.emit("send-message", payload);
                      pushToChat(payload, chats);
                    }}
                  >
                    <Image src={MessageWhite} alt="upload" className="mx-5" />
                  </div>
                </div>
              </>
            )}
          </div>
          {phoneCallInterface.isOpen && <PhoneCallUI />}
          <div className="flex flex-col justify-between items-end w-full  max-w-[70px]">
            <SideNavigation />
            <div
              className="p-5 bg-[#202121] rounded-lg cursor-pointer"
              onClick={() => {
                dispatch(toggleChatInterfaceTab({ tab: 1 }));
              }}
            >
              <Image src={NewChatWhite} alt="New Chat" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
