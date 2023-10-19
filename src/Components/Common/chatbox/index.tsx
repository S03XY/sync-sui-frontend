import DeliveredWhite from "@/assets/deliveredWhite.svg";
import DeliveredBlue from "@/assets/deliveredBlue.svg";
import Image from "next/image";

export enum MessageStatus {
  NOT_DELIVERED,
  DELIVERED,
  OPENED,
}

export const ChatBox = ({
  message,
  date,
  status,
  isReceiver,
}: {
  message: string;
  date: string;
  status: MessageStatus;
  isReceiver: boolean;
}) => {
  return (
    <div className={`flex ${!isReceiver ? "justify-start":"justify-end"} items-center w-full p-4`}>
      <div
        className={`${
          !isReceiver ? "bg-[#191919]" : "bg-[#010707]"
        } py-2 rounded-lg px-4  max-w-[350px] `}
      >
        <div className=""> {message}</div>
        <div className="flex justify-between items-center mt-2 space-x-4">
          <div>
            {new Intl.DateTimeFormat("en-US", { dateStyle: "short" }).format(
              new Date(date)
            )}
          </div>
          <div>
            {status === MessageStatus.DELIVERED ? (
              <div>
                <Image src={DeliveredWhite} alt="" />
              </div>
            ) : (
              status === MessageStatus.OPENED && (
                <div>
                  <Image src={DeliveredBlue} alt="" />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
