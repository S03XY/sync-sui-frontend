"use client";

import ChatWhite from "@/assets/chatWhite.svg";
import PhoneWhite from "@/assets/phoneWhite.svg";
import ScanWhite from "@/assets/scanIcon.svg";
import MoreAppWhite from "@/assets/moreAppWhite.svg";
import SettingsWhite from "@/assets/settingWhite.svg";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

export const SideNavigation = () => {
  const [tab, setTab] = useState(0);

  const Navigation = useMemo(
    () => [
      { Chat: ChatWhite },
      { Phone: PhoneWhite },
      { Scan: ScanWhite },
      { MoreApp: MoreAppWhite },
      { Settings: SettingsWhite },
    ],
    []
  );

  return (
    <div className="bg-[#202121] rounded-lg w-full">
      {Navigation.map((d, i) => {
        return (
          <div
            key={i}
            className={`p-5 cursor-pointer ${
              tab === i && "bg-[#0075FF] rounded-lg"
            }`}
            onClick={() => {
              setTab(i);
            }}
          >
            <Image src={Object.values(d)[0]} alt={`${Object.keys(d)[0]}`} />
          </div>
        );
      })}
    </div>
  );
};
