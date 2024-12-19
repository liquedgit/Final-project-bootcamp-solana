import { getSpesificLike } from "@/services/like.service";
import { removeUnusedBytes } from "@/utils/program";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export class Thread{
    threadAuthor: PublicKey;
    title: string;
    content: string;
    tags: string[];
    likes: number;
    address: PublicKey;
    isLiked: boolean;
    
    constructor(threadAuthor: PublicKey, title: number[], content: number[], tags: number[][], likes : BN, address: PublicKey, isLiked : boolean) {
        this.threadAuthor = threadAuthor;
        this.title = String.fromCharCode(...removeUnusedBytes(title)).trimEnd()
        this.content = String.fromCharCode(...removeUnusedBytes(content)).trimEnd()
        this.likes = Number(likes)
        this.tags = tags
        .map((tag) => String.fromCharCode(...removeUnusedBytes(tag)).trimEnd())
        .filter((tagString) => tagString !== "");
        this.address = address;
        this.isLiked = isLiked;
    }

}