import { Connection, PublicKey } from "@solana/web3.js"
import rawIdl  from "@/utils/reddit_app.json"
import { COMMENT_SEED, LIKE_SEED, THREAD_SEED } from "./constant"
import { AnchorWallet } from "@solana/wallet-adapter-react"
import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider, Idl, Program, Wallet } from "@coral-xyz/anchor";
import { RedditApp } from "@/types/reddit_app";
import crypto from "crypto";


// const programId = new PublicKey("948Y5WA66LqmCWN5327XtCvgXKLAeoGsF3inGd2XgUW8")
export const getDummyWallet = (): Wallet => {
    const dummyKeypair = anchor.web3.Keypair.generate();
    
    return {
        publicKey: dummyKeypair.publicKey,
        signTransaction: async (tx) => tx, 
        signAllTransactions: async (txs) => txs,
        payer: dummyKeypair,
    };
};
export const getProgram = (connection : Connection , wallet : AnchorWallet | Wallet) : Program<RedditApp> =>{
    const provider = new AnchorProvider(connection, wallet,{
        preflightCommitment: "confirmed"
    } )
    const IDL: RedditApp = rawIdl as RedditApp;
    const program = new Program<RedditApp>(IDL, provider)
    return program 
}

export const getThreadAddress = (topic: string, author : PublicKey, programId: PublicKey)=>{
    return PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode(topic),
          anchor.utils.bytes.utf8.encode(THREAD_SEED),
          author.toBuffer()
        ], programId);
}

export function getLikeAddress(author: PublicKey, parent: PublicKey, programID: PublicKey){
    return PublicKey.findProgramAddressSync([
      anchor.utils.bytes.utf8.encode(LIKE_SEED),
      author.toBuffer(),
      parent.toBuffer()
    ], programID)
  }

export function getCommentAddress(comment_content: string, author: PublicKey, parent: PublicKey, programID: PublicKey){
    let hexString = crypto.createHash('sha256').update(comment_content, 'utf-8').digest('hex');
    let content_seed = Uint8Array.from(Buffer.from(hexString, 'hex'));
    return PublicKey.findProgramAddressSync([
      author.toBuffer(),
      anchor.utils.bytes.utf8.encode(COMMENT_SEED),
      content_seed,
      parent.toBuffer()
    ], programID)
}

export const removeUnusedBytes=(data: number[])=>{
    const lastUsedIndex = data.lastIndexOf(0);
    // console.log(lastUsedIndex)
    // console.log(String.fromCharCode(...data.slice(0, lastUsedIndex+1)))
    return data.slice(0, lastUsedIndex+1)
}

export const cleanString = (datas: string[])=>{
    return datas.filter(
        (data) => data.trim().replace(/\u0000/g, "").length > 0 
    );
}