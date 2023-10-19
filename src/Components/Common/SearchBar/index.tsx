import Image from "next/image";
import { twMerge } from "tailwind-merge";
import SearchIcon from "@/assets/whiteSearchIcon.svg";
import { Input } from "postcss";
import { ChangeEvent } from "react";

export interface ISearchBar {
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const SearchBar = ({ placeholder, onChange, className }: ISearchBar) => {
  return (
    <div
      className={twMerge(
        `flex justify-start items-center space-x-4 bg-[#202121] pl-4 rounded-lg w-full max-w-[40vw] ${className}`
      )}
    >
      <div>
        <Image src={SearchIcon} alt="search icon" />
      </div>
      <input
        type="text"
        className=" text-[16px] h-full w-full rounded-lg  bg-transparent focus:outline-none px-2"
        placeholder={placeholder ? placeholder : "Search"}
        onChange={onChange}
      />
    </div>
  );
};
