import { PublicKey } from "@solana/web3.js";
import { debounce } from "lodash";

export const onDebounce = debounce((callback: () => void) => {
  if (callback) {
    callback();
  }
}, 300);

export const isValidSolanaAddress = async (
  address: string
): Promise<boolean> => {
  try {
    const pubkey = new PublicKey(address);
    return PublicKey.isOnCurve(pubkey);
  } catch (err) {
    return false;
  }
};
