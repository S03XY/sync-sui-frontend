import { constants } from "buffer";
import React from "react";
import { twMerge } from "tailwind-merge";

export interface ISizableButton {
  text: String;
  className?: string;
  onclick?: () => void;
}

export const SizableButton = ({ text, className, onclick }: ISizableButton) => {
  return (
    <button
      className={twMerge(
        `px-10 py-5 bg-[#0075FF] rounded-lg whitespace-nowrap  ${className}`
      )}
      onClick={onclick ? onclick : () => {}}
    >
      {text}
    </button>
  );
};
