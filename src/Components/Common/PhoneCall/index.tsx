import Image from "next/image";

import DefaultProfilePicture from "@/assets/defaultProfilePic.svg";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { trimStringInMiddle } from "@/utils/stringUtils";
import disconnectPhoneWhite from "@/assets/disconnectPhoneWhite.svg";
import videoCallWhite from "@/assets/videoCallWhite.svg";
import { twMerge } from "tailwind-merge";
import {
  PhoneCallType,
  setMediaStream,
  togglePhoneCallUI,
} from "@/redux/reducers/phoneCallUI";
import { useSocket } from "@/Components/SocketProvider";

import IncomingCall from "@/assets/incomingWhite.svg";
import OutgoingCall from "@/assets/outgoingAudioCall.svg";
import { useGetRTCPeerConnection } from "@/Components/RTCProvider";
import { Socket } from "socket.io-client";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { createImmutableStateInvariantMiddleware } from "@reduxjs/toolkit";
import { convertCompilerOptionsFromJson } from "typescript";

export const PhoneCallUI = () => {
  const currentActiveChat = useAppSelector((state) => state.currentActiveChat);
  const currentActiveUser = useAppSelector((state) => state.currentUser);
  const dispatch = useAppDispatch();
  const phoneCallUIType = useAppSelector((state) => state.phoneCallInterface);
  const rtcPeerConnection = useGetRTCPeerConnection()?.rtcPeerConnection;
  const socket = useSocket();
  const [disableCallButton, setDisableCallButton] = useState<boolean>(false);
  const setRTCPeerConnection = useGetRTCPeerConnection()?.setRTCPeerConnection!;
  const [senderICECandidate, setSenderICECandidate] = useState<
    RTCIceCandidate[]
  >([]);

  const [hours, setHours] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);

  // useEffect(() => {
  //   console.log("sendericecandidate", senderICECandidate);
  // }, [senderICECandidate]);

  const [connectionStatus, setConnectionStatus] =
    useState<string>("Connecting...");

  const audioRef = useRef<HTMLAudioElement>(null);
  const senderVideoRef = useRef<HTMLVideoElement>(null);
  const receiverVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    socket?.on("call-accepted", (payload) => {
      rtcPeerConnection?.setRemoteDescription(
        new RTCSessionDescription(payload.answer)
      );

      // rtcPeerConnection?.addEventListener("icecandidate", (e) => {
      //   console.log("Sending ice from caller to receiver");
      //   socket?.emit("sender-ice-candidate", {
      //     receiverSocketId: currentActiveChat.socketId,
      //     candidate: e.candidate,
      //     receiverUserId: currentActiveChat.userId,
      //     senderUserId: currentActiveUser.userId,
      //   });
      // });
    });

    socket?.on("receive-sender-ice-candidate", (payload) => {
      if (rtcPeerConnection?.signalingState !== "closed") {
        if (payload.candidate) {
          rtcPeerConnection?.addIceCandidate(payload.candidate);
        }
      }
    });

    socket?.on("receive-sender-ice-candidate-directly", (payload) => {
      if (payload.candidate) {
        const ice = senderICECandidate;
        ice.push(new RTCIceCandidate(payload.candidate));
        setSenderICECandidate([...ice]);
      }
    });

    return () => {
      socket?.off("call-accepted");
      socket?.off("receiver-sender-ice-candidate");
      socket?.off("receive-sender-ice-candidate-directly");
      // rtcPeerConnection?.removeEventListener("icecandidate");
    };
  }, [
    socket,
    rtcPeerConnection,
    currentActiveChat.socketId,
    currentActiveChat.userId,
    currentActiveUser.userId,
  ]);

  useEffect(() => {
    rtcPeerConnection?.addEventListener("track", (e) => {
      if (audioRef.current && e.streams) {
        audioRef.current.srcObject = e.streams[0]!;
      } else {
        if (receiverVideoRef && e.streams) {
          receiverVideoRef.current!.srcObject = e.streams[0];
        }
      }
    });
  }, [rtcPeerConnection]);

  useEffect(() => {
    if (
      phoneCallUIType.mediaStream &&
      senderVideoRef &&
      !phoneCallUIType.isAudioCall
    ) {
      senderVideoRef.current!.srcObject = phoneCallUIType.mediaStream!;
    }
  }, [phoneCallUIType.mediaStream]);

  const startStopTimer = () => {
    setInterval(() => {
      setSeconds((prev) => prev + 1);
      if (seconds === 59) {
        setHours((prev) => prev + 1);
        setSeconds(0);
      }
    }, 1000);
  };

  const hangUp = async () => {
    const senders = rtcPeerConnection?.getSenders();
    senders?.forEach((sender) => {
      const track = sender.track;
      if (track) {
        track.stop();
      }
    });

    phoneCallUIType.mediaStream?.getTracks().forEach((t) => {
      t.stop();
    });
    rtcPeerConnection?.close();
    dispatch(setMediaStream({ mediaStream: undefined }));
    dispatch(togglePhoneCallUI({ isOpen: false }));
  };

  useEffect(() => {
    rtcPeerConnection?.addEventListener("connectionstatechange", (e) => {
      switch (rtcPeerConnection.connectionState) {
        case "connected":
          setConnectionStatus("Connected");
          startStopTimer();
          setDisableCallButton(true);
          break;
        default:
          setConnectionStatus("Connecting...");
          setDisableCallButton(false);
          break;
      }
    });

    return () => {};
  }, [rtcPeerConnection, seconds]);

  return (
    <div className="h-full w-[600px]  bg-[#202121] rounded-lg grid grid-rows-[0.5fr,4fr,0.5fr] ">
      <div className="flex justify-center items-center ">
        <div className="flex justify-center items-center p-1 px-4 bg-[#3B3B3B] rounded-lg">
          {phoneCallUIType.type === PhoneCallType.INCOMING ? (
            <div className="flex justify-center items-center p-2 ">
              <Image src={IncomingCall} alt="incomingcall" />
            </div>
          ) : (
            <div className="flex justify-center items-center p-2 ">
              <Image src={OutgoingCall} alt="incomingcall" />
            </div>
          )}{" "}
          <p>
            {connectionStatus === "Connecting..." ? (
              `${connectionStatus}`
            ) : (
              <div className="flex justify-start space-x-4 items-center">
                <p>{`${connectionStatus}`}</p>
                <div>
                  <div>{`${hours < 10 ? `0${hours}` : `${hours}`}:${
                    seconds < 10 ? `0${seconds}` : `${seconds}`
                  }`}</div>
                </div>
              </div>
            )}
          </p>
        </div>
      </div>
      {phoneCallUIType.isAudioCall ? (
        <div className="flex flex-col justify-center items-center bg-[#3B3B3B]  rounded-lg">
          <div className="flex justify-center items-center flex-col relative">
            <div>
              <Image src={DefaultProfilePicture} alt="" />
            </div>
            <div className="absolute">
              <audio ref={audioRef} autoPlay>
                Your browser doesnot support this audio
              </audio>
            </div>
          </div>

          <div>
            {phoneCallUIType.type === PhoneCallType.INCOMING
              ? trimStringInMiddle(
                  phoneCallUIType.callerDetails?.senderWalletAddress!,
                  4
                )
              : trimStringInMiddle(currentActiveChat.remoteWalletAddress, 4)}
          </div>

          <div>
            {phoneCallUIType.type === PhoneCallType.INCOMING
              ? `@${phoneCallUIType.callerDetails?.senderUserId}`
              : `@${currentActiveChat.userId}`}
          </div>
        </div>
      ) : (
        <div className="">
          <div className="flex  w-full h-full relative ">
            <video
              ref={receiverVideoRef}
              autoPlay
              playsInline
              className="rounded-lg object-cover"
            >
              your browser doesnt support video streaming
            </video>
            {phoneCallUIType.mediaStream ? (
              <div className="h-[200px] w-[200px] rounded-xl absolute top-[calc(100%-205px)] left-[calc(100%-200px)] border-2 border-[#202121]  ">
                <video
                  ref={senderVideoRef}
                  autoPlay
                  playsInline
                  className="rounded-lg object-cover h-[200px] w-[200px]"
                >
                  your browser doesnt support video streaming
                </video>
              </div>
            ) : (
              <div className="bg-[#010707] flex justify-center items-center rounded-lg h-[200px] w-[200px] absolute top-[calc(100%-205px)] left-[calc(100%-200px)] border-2 border-[#202121]">
                <Image src={DefaultProfilePicture} alt="caller" className="" /> 
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex justify-between px-4  items-center w-full">
        <PhoneCallButton icon={videoCallWhite} iconName="video call" />
        <div className="flex justify-end items-center space-x-4">
          {phoneCallUIType.type === PhoneCallType.INCOMING && (
            <PhoneCallButton
              className={`${
                disableCallButton ? "bg-gray-900" : "bg-green-900"
              }`}
              icon={disconnectPhoneWhite}
              iconName="connect call"
              callback={async () => {
                rtcPeerConnection?.setRemoteDescription(
                  new RTCSessionDescription(
                    phoneCallUIType.callerDetails?.offer!
                  )
                );

                let constraints;
                if (phoneCallUIType.isAudioCall) {
                  constraints = {
                    audio: true,
                    video: false,
                  };
                } else {
                  constraints = {
                    audio: false,
                    video: { height: { ideal: 1280 }, width: { ideal: 720 } },
                  };
                }

                try {
                  const stream =
                    await window.navigator.mediaDevices.getUserMedia(
                      constraints
                    );

                  stream.getTracks().forEach((track) => {
                    rtcPeerConnection?.addTrack(track, stream);
                  });
                  dispatch(setMediaStream({ mediaStream: stream }));
                } catch (err) {
                  toast("Not able to get microphone access");
                  return;
                }

                const answer = await rtcPeerConnection?.createAnswer();
                rtcPeerConnection?.setLocalDescription(
                  new RTCSessionDescription(answer!)
                );

                const payload = { ...phoneCallUIType.callerDetails, answer };
                socket?.emit("create-answer", payload);

                rtcPeerConnection?.addEventListener("icecandidate", (e) => {
                  if (e.candidate !== null) {
                    socket?.emit("sender-ice-candidate", {
                      receiverSocketId:
                        phoneCallUIType.callerDetails?.senderSocketId,
                      candidate: e.candidate,
                      receiverUserId:
                        phoneCallUIType.callerDetails?.senderUserId,
                      senderUserId: currentActiveUser.userId,
                    });
                  }
                });

                if (senderICECandidate.length > 0) {
                  senderICECandidate.forEach((candidate) => {
                    if (candidate) {
                      rtcPeerConnection?.addIceCandidate(candidate);
                    }
                  });
                }
              }}
            />
          )}

          <PhoneCallButton
            className="bg-red-400"
            icon={disconnectPhoneWhite}
            iconName="disconnect call"
            callback={async () => {
              socket?.emit("disconnectCaller", {
                receiverSocketId: phoneCallUIType.callerDetails?.senderSocketId,
              });
              await hangUp();
              setRTCPeerConnection(false);
            }}
          />
        </div>
      </div>
    </div>
  );
};

const PhoneCallButton = ({
  icon,
  callback,
  className,
  iconName,
}: {
  icon: any;
  callback?: () => void;
  className?: string;
  iconName: string;
}) => {
  return (
    <div
      className={twMerge(
        className,
        "p-3 border-white border-[1px] rounded-lg cursor-pointer "
      )}
      onClick={() => {
        callback && callback();
      }}
    >
      <Image src={icon} alt={iconName} />
    </div>
  );
};
