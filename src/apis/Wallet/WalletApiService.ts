import { PublicKey } from "@solana/web3.js";
import { BASE_URL } from "../constants";

class WalletApiService {
  public readonly base: string;
  constructor() {
    this.base = `${BASE_URL}/wallet`;
  }

  isWalletRegistered = async (walletAddress: string) => {
    const response = await fetch(
      `${this.base}/is-wallet-registered/${walletAddress}`
    );

    const data = await response.json();
    return data;
  };

  registerNewWallet = async (walletAddress: string, userId: string) => {
    const response = await fetch(`${this.base}/register-wallet`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        walletAddress,
        userId,
      }),
    });

    const data = await response.json();
    return data;
  };

  getWalletInfo = async (userInput: string) => {
    let isValid: boolean = false;

    let options: { walletAddress?: string; userId?: string };

    try {
      const userPubkey = new PublicKey(userInput);
      isValid = PublicKey.isOnCurve(userPubkey);
      options = { walletAddress: userInput };
    } catch (err) {
      options = { userId: userInput };
    }
    const response = await fetch(`${this.base}/get-wallet-info`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(options),
    });

    const data = await response.json();
    return data;
  };

  requestChat = async (currentUserId: string, otherUserId: string) => {
    const requestChatResponse = await fetch(`${this.base}/request-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentUserId: currentUserId,
        otherUserId: otherUserId,
      }),
    });
  };

  getContacts = async (currentUserId: string, request: boolean, limit = 10) => {
    const contacts = await fetch(
      `${this.base}/get-contacts/?userId=${currentUserId}&request=${request}&limit=${limit}`
    );

    return await contacts.json();
  };
}

const WalletApiServiceObj = new WalletApiService();

export default WalletApiServiceObj;
