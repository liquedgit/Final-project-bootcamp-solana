import { RedditApp } from "@/types/reddit_app"
import { Program } from "@coral-xyz/anchor"
import { PublicKey } from "@solana/web3.js"

export const getAllThreads = async(program : Program<RedditApp>)=>{
    try{
        const threads = await program.account.thread.all()
        return threads
    }catch(error){
        console.error(error)
        return null
    }
}

export const getSpesificThreads = async(program: Program<RedditApp>, threadPk : PublicKey)=>{
    try{
        const thread = await program.account.thread.fetch(threadPk)
        return thread
    }catch(error){
        console.error(error)
        return null
    }
}