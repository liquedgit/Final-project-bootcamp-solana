import { removeUnusedBytes } from "@/utils/program";
import { PublicKey } from "@solana/web3.js";

export class Comment{
    commentAuthor : PublicKey;
    comment : string;
    address: PublicKey;
    parent: PublicKey;
    constructor(commentAuthor: PublicKey, comment: number[], address: PublicKey, parent: PublicKey){
        this.commentAuthor = commentAuthor;
        this.address = address;
        this.parent = parent;
        this.comment = String.fromCharCode(...removeUnusedBytes(comment))
    }
}