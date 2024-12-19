import { RedditApp } from "@/types/reddit_app"
import { Program } from "@coral-xyz/anchor"
import { Connection, PublicKey } from "@solana/web3.js"
import * as anchor from "@coral-xyz/anchor"
import { COMMENT_DISCRIMINATOR, COMMENT_LENGTH } from "@/utils/constant"
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes"

export async function commentMutate(program: Program<RedditApp>, content : string, commentPk : PublicKey, author: PublicKey, parent: PublicKey){
    try{
        const tx = await program.methods.commentThread(content).accounts({
            comment: commentPk,
            commentAuthority: author,
            //@ts-ignore
            thread: parent,
            systemProgram: anchor.web3.SystemProgram.programId
        }).signers([]).rpc({commitment:"confirmed"})
        return tx
    }catch(error){
        console.error(error)
        return null
    }
}

export async function getCommentsForThread(program : Program<RedditApp>,connection : Connection, programId: PublicKey, parent: PublicKey){
    const commentDiscriminator = getCommentDiscriminator();

    const accounts = await connection.getProgramAccounts(programId, {
        filters:[
            {
                memcmp:{
                    offset:0,
                    bytes: bs58.encode(commentDiscriminator)
                }
            },
            {
                memcmp:{
                    offset:41,
                    bytes: parent.toBase58()
                }
            }
        ]
    })

    const commentAccounts = await program.account.comment.fetchMultiple(
        accounts.map((account) => account.pubkey)
    );

    const programAccounts = accounts.map((account, index) => ({
        pubkey: account.pubkey,
        account: commentAccounts[index],
    }));

    return programAccounts;
}

export async function deleteComments(program: Program<RedditApp>, commentPk: PublicKey, author: PublicKey){
    try {
        const tx = await program.methods.uncommentThread().accounts({
            comment: commentPk,
            commentAuthority: author
        }).signers([]).rpc({commitment:"confirmed"})
        return tx
    } catch (error) {
        console.error(error)
        return null
    }
}

// function deserializeComment(data: Buffer) {
//     return {
//       discriminator: data.readUInt8(8),
//       commentAuthor: new PublicKey(data.slice(, 33)),
//       parentThread: new PublicKey(data.slice(33, 65)),
//       content: data.slice(65, 65 + COMMENT_LENGTH).toString("utf-8").trim(),
//       contentLength: data.readUInt8(65),
//       bump: data.readUInt8(66),
//     };
//   }

function getCommentDiscriminator(): Buffer {
    const name = "account:Comment";
    return Buffer.from(require("crypto").createHash("sha256").update(name).digest().slice(0, 8));
}