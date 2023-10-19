import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type IRTCPeerConnection = {
  rtcPeerConnection: RTCPeerConnection | null;
  setRTCPeerConnection: (isNull: boolean) => void;
};

const RTCPeerConnectionContext = createContext<IRTCPeerConnection | null>(null);

export const RTCPeerConnectionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [rtcPeerConnection, setRTCPeerConnection] =
    useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    setUpConnection(false);
    return () => {
      rtcPeerConnection?.close();
    };
  }, []);

  const setUpConnection = useCallback(async (isNull: boolean) => {
    if (isNull) {
      setRTCPeerConnection(null);
      return;
    }

    setRTCPeerConnection(
      new RTCPeerConnection({
        iceCandidatePoolSize: 100,
        iceServers: [
          {
            urls: [
              "stun:stun1.l.google.com:19302",
              "stun:stun2.l.google.com:19302",
              "stun:stun.l.google.com:19302",
              "stun:stun3.l.google.com:19302",
              "stun:stun4.l.google.com:19302",
            ],
          },
        ],
      })
    );
  }, []);

  return (
    <RTCPeerConnectionContext.Provider
      value={{
        rtcPeerConnection: rtcPeerConnection,
        setRTCPeerConnection: setUpConnection,
      }}
    >
      {children}
    </RTCPeerConnectionContext.Provider>
  );
};

export const useGetRTCPeerConnection = (): IRTCPeerConnection | null => {
  return useContext(RTCPeerConnectionContext);
};
