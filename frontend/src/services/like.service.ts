import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor"
import { LIKE_SEED } from "@/utils/constant";
import { RedditApp } from "@/types/reddit_app";

export const getSpesificLike = async(program : Program<RedditApp>,likePk : PublicKey
)=>{
    try{
        const like = await program.account.like.fetch(likePk)
        return like
    }catch(error){
        console.error(error)
        return null;
    }
    
}

export const getAllLike = async(program: Program<RedditApp>)=>{
    try{
        const likes = await program.account.like.all()
        return likes;
    }catch(error){
        console.error(error)
        return null
    }
}

export const likeMutate = async(program : Program<RedditApp>, wallet: PublicKey, thread: PublicKey)=>{
    try{
        const tx = await program.methods.likeThread({like:{}}).accounts({
            likeAuthority: wallet,
            //@ts-ignore
            thread: thread
        }).signers([]).rpc({commitment:"confirmed"})
        return tx
    }catch(error){
        console.error(error)
        return null;
    }
}

export const unlikeMutate = async(program: Program<RedditApp>, author: PublicKey, parent: PublicKey)=>{
    try {
        const tx = await program.methods.removeLikeThread().accounts({
            likeAuthor: author,
            //@ts-ignore
            thread: parent
        }).signers([]).rpc({commitment:"confirmed"})
        return tx
    } catch (error) {
        console.error(error)
        return null
    }
}