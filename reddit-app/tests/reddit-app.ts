import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { RedditApp } from "../target/types/reddit_app";
import { PublicKey } from '@solana/web3.js';
import { assert } from "chai";
import crypto from "crypto";

const THREAD_SEED = "THREAD_SEED"
const COMMENT_SEED = "COMMENT_SEED"
const LIKE_SEED = "LIKE_SEED"
describe("reddit-app", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.RedditApp as Program<RedditApp>;
  const bob = anchor.web3.Keypair.generate();
  const alice = anchor.web3.Keypair.generate();
  const provider = anchor.AnchorProvider.env();

  const title = "Solana Thread";
  const content = "This is a sample thread for testing Solana programs.";
  const tags = ["rust", "solana", "anchor"];
  describe("Initialize thread", async()=>{
    it("Initializes a thread!", async () => {
  
      await airdrop(provider.connection, bob.publicKey);
  
      // Derive the thread PDA
      const [threadPda, bump] = getThreatAddress(title, bob.publicKey, program.programId)
      
      // Execute the transaction to initialize the thread
      const tx = await program.methods.initialize(title, content, tags)
        .accounts({
          thread: threadPda,
          threadAuthority: bob.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([bob]).rpc({commitment:"confirmed"})
  
  
      // Fetch and validate the thread account
      const threadAccount = await program.account.thread.fetch(threadPda);
  
  
      // Assertions
      assert.strictEqual(threadAccount.threadAuthor.toString(), bob.publicKey.toString())
      assert.strictEqual(threadAccount.title.toString(), padByteArrayWithZeroes(stringToUtf8ByteArray(title), 32).toString())
        assert.strictEqual(threadAccount.content.toString(), padByteArrayWithZeroes(stringToUtf8ByteArray(content), 500).toString())
        const validTags = threadAccount.tags.filter(
          (tag: number[]) => !tag.every((byte) => byte === 0)
        );
        assert.strictEqual(validTags.length, tags.length)
        validTags
        validTags.forEach((tag,idx)=>{
          const inputtedTag = padByteArrayWithZeroes(stringToUtf8ByteArray(tags[idx]),10)
          assert.strictEqual(inputtedTag.toString(), tag.toString())
        })
        assert.strictEqual(threadAccount.bump.toString(), bump.toString())
  
    });
    it("Intialize thread with title longer than 32 bytes !", async()=>{
      let should_fail = "This Should fail"
      try{
        await airdrop(provider.connection, bob.publicKey)
        const [thread_pkey, bump] = getThreatAddress("a".repeat(200), bob.publicKey, program.programId)
        await program.methods.initialize("a".repeat(200), "Just testing", ["test", "test2"]).accounts({
          threadAuthority: bob.publicKey,
          thread: thread_pkey,
          systemProgram: anchor.web3.SystemProgram.programId
        }).signers([bob]).rpc({commitment:"confirmed"})
      }catch(error){
        assert.strictEqual(error.message, "Max seed length exceeded")
        should_fail = "Failed";
      }
      assert.strictEqual(should_fail , "Failed");
    })
    it("Intialize thread with content longer than 500 bytes !", async()=>{
      let should_fail = "This Should fail"
      try{
        await airdrop(provider.connection, bob.publicKey)
        const [thread_pkey, bump] = getThreatAddress("test content 500 bytes", bob.publicKey, program.programId)
        await program.methods.initialize("test content 500 bytes", "a".repeat(600), ["test", "test2"]).accounts({
          threadAuthority: bob.publicKey,
          thread: thread_pkey,
          systemProgram: anchor.web3.SystemProgram.programId
        }).signers([bob]).rpc({commitment:"confirmed"})
      }catch(error){
        assert.strictEqual(error.error.errorCode.code, "ContentTooLong")
        should_fail = "Failed";
      }
      assert.strictEqual(should_fail , "Failed");
    })
    it("Intialize thread with tags more than 10", async()=>{
      let should_fail = "This Should fail"
      try{
        await airdrop(provider.connection, bob.publicKey)
        const [thread_pkey, bump] = getThreatAddress("a", bob.publicKey, program.programId)
        await program.methods.initialize("a", "b", Array.from({ length: 15 }, (_, index) => `test${index + 1}`)).accounts({
          threadAuthority: bob.publicKey,
          thread: thread_pkey,
          systemProgram: anchor.web3.SystemProgram.programId
        }).signers([bob]).rpc({commitment:"confirmed"})
      }catch(error){
        assert.strictEqual(error.error.errorCode.code, "TagTooMany")
        should_fail = "Failed";
      }
      assert.strictEqual(should_fail , "Failed");
    })
    it("Initialize thread with tags length more than 10", async()=>{
      let should_fail = "This Should fail"
      try{
        await airdrop(provider.connection, bob.publicKey)
        const [thread_pkey, bump] = getThreatAddress("a", bob.publicKey, program.programId)
        await program.methods.initialize("a", "b", ["tes1","tes2".repeat(20)]).accounts({
          threadAuthority: bob.publicKey,
          thread: thread_pkey,
          systemProgram: anchor.web3.SystemProgram.programId
        }).signers([bob]).rpc({commitment:"confirmed"})
      }catch(error){
        assert.strictEqual(error.error.errorCode.code, "TagTooLong")
        should_fail = "Failed";
      }
      assert.strictEqual(should_fail , "Failed");
    })
  })

  describe("Alice decided to comment about bob's thread would be great !", async()=>{
    it("Her comment is too long", async()=>{
      let should_fail = "This Should fail"
      try{
        await airdrop(provider.connection, alice.publicKey)
        const [thread_pkey, thread_bump] = getThreatAddress(title, bob.publicKey, program.programId)
        const [comment_pkey, comment_bump] = getCommentAddress("a".repeat(250), alice.publicKey, thread_pkey, program.programId)
        await program.methods.commentThread("a".repeat(250)).accounts({
          comment: comment_pkey,
          commentAuthority: alice.publicKey,
          thread: thread_pkey,
          systemProgram: anchor.web3.SystemProgram.programId
        }).signers([alice]).rpc({commitment:"confirmed"})
      }catch(error){
        assert.strictEqual(error.error.errorCode.code, "CommentContentTooLong")
        should_fail = "Failed";
      }
      assert.strictEqual(should_fail , "Failed");
    })
    it("Now alice try to shorten her comment", async()=>{
        await airdrop(provider.connection, alice.publicKey)
        const [thread_pkey, thread_bump] = getThreatAddress(title, bob.publicKey, program.programId)
        const [comment_pkey, comment_bump] = getCommentAddress("Wow, it is a great insight", alice.publicKey, thread_pkey, program.programId)
        await program.methods.commentThread("Wow, it is a great insight").accounts({
          comment: comment_pkey,
          commentAuthority: alice.publicKey,
          thread: thread_pkey,
          systemProgram: anchor.web3.SystemProgram.programId
        }).signers([alice]).rpc({commitment:"confirmed"})

        const commentAccount = await program.account.comment.fetch(comment_pkey);
        assert.strictEqual(commentAccount.comment.toString(), padByteArrayWithZeroes(stringToUtf8ByteArray("Wow, it is a great insight"), 200).toString())
        assert.strictEqual(commentAccount.bump.toString(),comment_bump.toString())
    })
  })

  describe("Alice changed her mind, she wants to delete the comment", async()=>{
    it("Alice delete her comment on bob's post", async()=>{
      await airdrop(provider.connection, alice.publicKey)
      const [threadPk, bump_thread] = getThreatAddress(title, bob.publicKey, program.programId)
      const [commentPk, bump_comment] = getCommentAddress("Wow, it is a great insight", alice.publicKey, threadPk,program.programId)
      const tx = await program.methods.uncommentThread().accounts({
        comment: commentPk,
        commentAuthority: alice.publicKey
      }).signers([alice]).rpc({commitment: "confirmed"})

      let shouldFail = false
      try{
        let commentData = await program.account.comment.fetch(commentPk)
      }catch(error){
        shouldFail = true
        assert.isTrue(error.message.includes("Account does not exist or has no data"))
      }
      assert.strictEqual(shouldFail, true)
    })
  })

  describe("Alice decided to give a like to bob's posts", async()=>{
    it("Alice give default like and unlike it", async()=>{
      const [threadPk, thread_bump] = await getThreatAddress(title, bob.publicKey, program.programId)
      const [likePk, like_bump] = await getLikeAddress(alice.publicKey, threadPk, program.programId)
      const threadDataBeforeLiked = await program.account.thread.fetch(threadPk)
      const tx = await program.methods.likeThread({like:{}}).accounts({
        likeAuthority: alice.publicKey,
        thread: threadPk,
      }).signers([alice]).rpc({commitment:"confirmed"})
      // console.log(tx)
      const commentData = await program.account.like.fetch(likePk)
      const threadDataAfterLiked  = await program.account.thread.fetch(threadPk)
      assert.strictEqual(commentData.bump.toString(), like_bump.toString())
      assert.strictEqual(commentData.likeAuthor.toString(), alice.publicKey.toString())
      assert.strictEqual(commentData.parent.toString(), threadPk.toString())
      assert.deepStrictEqual(commentData.reaction, {like:{}})
      assert.strictEqual(Number(threadDataBeforeLiked.likes) + 1, Number(threadDataAfterLiked.likes))

      await program.methods.removeLikeThread().accounts({
        likeAuthor: alice.publicKey,
        thread: threadPk
      }).signers([alice]).rpc({commitment:"confirmed"})
      const threadDataAfterDisLiked = await program.account.thread.fetch(threadPk)
      let shouldFail = false;
      try{
        const like = await program.account.like.fetch(likePk)
      }catch(error){
        assert.isTrue(error.message.includes("Account does not exist or has no data"))
        shouldFail = true
      }
      assert.strictEqual(shouldFail, true)
      assert.strictEqual(Number(threadDataAfterLiked.likes)-1, Number(threadDataAfterDisLiked.likes))
    })
    it("Alice give celebrate and unlike it", async()=>{
      const [threadPk, thread_bump] = await getThreatAddress(title, bob.publicKey, program.programId)
      const [likePk, like_bump] = await getLikeAddress(alice.publicKey, threadPk, program.programId)
      const threadDataBeforeLiked = await program.account.thread.fetch(threadPk)
      const tx = await program.methods.likeThread({celebrate:{}}).accounts({
        likeAuthority: alice.publicKey,
        thread: threadPk,
      }).signers([alice]).rpc({commitment:"confirmed"})
      // console.log(tx)
      const commentData = await program.account.like.fetch(likePk)
      const threadDataAfterLiked  = await program.account.thread.fetch(threadPk)
      assert.strictEqual(commentData.bump.toString(), like_bump.toString())
      assert.strictEqual(commentData.likeAuthor.toString(), alice.publicKey.toString())
      assert.strictEqual(commentData.parent.toString(), threadPk.toString())
      assert.deepStrictEqual(commentData.reaction, {celebrate:{}})
      assert.strictEqual(Number(threadDataBeforeLiked.likes) + 1, Number(threadDataAfterLiked.likes))

      await program.methods.removeLikeThread().accounts({
        likeAuthor: alice.publicKey,
        thread: threadPk
      }).signers([alice]).rpc({commitment:"confirmed"});
      let shouldFail = false;
      try{
        const like = await program.account.like.fetch(likePk)
      }catch(error){
        assert.isTrue(error.message.includes("Account does not exist or has no data"))
        shouldFail = true
      }
      assert.strictEqual(shouldFail, true)
    })
    it("Alice give insightful and unlike it", async()=>{
      const [threadPk, thread_bump] = await getThreatAddress(title, bob.publicKey, program.programId)
      const [likePk, like_bump] = await getLikeAddress(alice.publicKey, threadPk, program.programId)
      const threadDataBeforeLiked = await program.account.thread.fetch(threadPk)
      const tx = await program.methods.likeThread({insightful:{}}).accounts({
        likeAuthority: alice.publicKey,
        thread: threadPk,
      }).signers([alice]).rpc({commitment:"confirmed"})
      // console.log(tx)
      const commentData = await program.account.like.fetch(likePk)
      const threadDataAfterLiked  = await program.account.thread.fetch(threadPk)
      assert.strictEqual(commentData.bump.toString(), like_bump.toString())
      assert.strictEqual(commentData.likeAuthor.toString(), alice.publicKey.toString())
      assert.strictEqual(commentData.parent.toString(), threadPk.toString())
      assert.deepStrictEqual(commentData.reaction, {insightful:{}})
      assert.strictEqual(Number(threadDataBeforeLiked.likes) + 1, Number(threadDataAfterLiked.likes))

      await program.methods.removeLikeThread().accounts({
        likeAuthor: alice.publicKey,
        thread: threadPk
      }).signers([alice]).rpc({commitment:"confirmed"})
      let shouldFail = false;
      try{
        const like = await program.account.like.fetch(likePk)
      }catch(error){
        assert.isTrue(error.message.includes("Account does not exist or has no data"))
        shouldFail = true
      }
      assert.strictEqual(shouldFail, true)
    })
    it("Alice give love and unlike it", async()=>{
      const [threadPk, thread_bump] = await getThreatAddress(title, bob.publicKey, program.programId)
      const [likePk, like_bump] = await getLikeAddress(alice.publicKey, threadPk, program.programId)
      const threadDataBeforeLiked = await program.account.thread.fetch(threadPk)
      const tx = await program.methods.likeThread({love:{}}).accounts({
        likeAuthority: alice.publicKey,
        thread: threadPk,
      }).signers([alice]).rpc({commitment:"confirmed"})
      // console.log(tx)
      const commentData = await program.account.like.fetch(likePk)
      const threadDataAfterLiked  = await program.account.thread.fetch(threadPk)
      assert.strictEqual(commentData.bump.toString(), like_bump.toString())
      assert.strictEqual(commentData.likeAuthor.toString(), alice.publicKey.toString())
      assert.strictEqual(commentData.parent.toString(), threadPk.toString())
      assert.deepStrictEqual(commentData.reaction, {love:{}})
      assert.strictEqual(Number(threadDataBeforeLiked.likes) + 1, Number(threadDataAfterLiked.likes))

      await program.methods.removeLikeThread().accounts({
        likeAuthor: alice.publicKey,
        thread: threadPk
      }).signers([alice]).rpc({commitment:"confirmed"})
      let shouldFail = false;
      try{
        const like = await program.account.like.fetch(likePk)
      }catch(error){
        assert.isTrue(error.message.includes("Account does not exist or has no data"))
        shouldFail = true
      }
      assert.strictEqual(shouldFail, true)
    })
    it("Alice give curious and unlike it", async()=>{
      const [threadPk, thread_bump] = await getThreatAddress(title, bob.publicKey, program.programId)
      const [likePk, like_bump] = await getLikeAddress(alice.publicKey, threadPk, program.programId)
      const threadDataBeforeLiked = await program.account.thread.fetch(threadPk)
      const tx = await program.methods.likeThread({curious:{}}).accounts({
        likeAuthority: alice.publicKey,
        thread: threadPk,
      }).signers([alice]).rpc({commitment:"confirmed"})
      // console.log(tx)
      const commentData = await program.account.like.fetch(likePk)
      const threadDataAfterLiked  = await program.account.thread.fetch(threadPk)
      assert.strictEqual(commentData.bump.toString(), like_bump.toString())
      assert.strictEqual(commentData.likeAuthor.toString(), alice.publicKey.toString())
      assert.strictEqual(commentData.parent.toString(), threadPk.toString())
      assert.deepStrictEqual(commentData.reaction, {curious:{}})
      assert.strictEqual(Number(threadDataBeforeLiked.likes) + 1, Number(threadDataAfterLiked.likes))

      await program.methods.removeLikeThread().accounts({
        likeAuthor: alice.publicKey,
        thread: threadPk
      }).signers([alice]).rpc({commitment:"confirmed"})
      let shouldFail = false;
      try{
        const like = await program.account.like.fetch(likePk)
      }catch(error){
        assert.isTrue(error.message.includes("Account does not exist or has no data"))
        shouldFail = true
      }
      assert.strictEqual(shouldFail, true)
    })
    it("Alice give support and unlike it", async()=>{
      const [threadPk, thread_bump] = await getThreatAddress(title, bob.publicKey, program.programId)
      const [likePk, like_bump] = await getLikeAddress(alice.publicKey, threadPk, program.programId)
      const threadDataBeforeLiked = await program.account.thread.fetch(threadPk)
      const tx = await program.methods.likeThread({support:{}}).accounts({
        likeAuthority: alice.publicKey,
        thread: threadPk,
      }).signers([alice]).rpc({commitment:"confirmed"})
      // console.log(tx)
      const commentData = await program.account.like.fetch(likePk)
      const threadDataAfterLiked  = await program.account.thread.fetch(threadPk)
      assert.strictEqual(commentData.bump.toString(), like_bump.toString())
      assert.strictEqual(commentData.likeAuthor.toString(), alice.publicKey.toString())
      assert.strictEqual(commentData.parent.toString(), threadPk.toString())
      assert.deepStrictEqual(commentData.reaction, {support:{}})
      assert.strictEqual(Number(threadDataBeforeLiked.likes) + 1, Number(threadDataAfterLiked.likes))

      await program.methods.removeLikeThread().accounts({
        likeAuthor: alice.publicKey,
        thread: threadPk
      }).signers([alice]).rpc({commitment:"confirmed"})
      let shouldFail = false;
      try{
        const like = await program.account.like.fetch(likePk)
      }catch(error){
        assert.isTrue(error.message.includes("Account does not exist or has no data"))
        shouldFail = true
      }
      assert.strictEqual(shouldFail, true)
    })
    it("Alice give funny", async()=>{
      const [threadPk, thread_bump] = await getThreatAddress(title, bob.publicKey, program.programId)
      const [likePk, like_bump] = await getLikeAddress(alice.publicKey, threadPk, program.programId)
      const threadDataBeforeLiked = await program.account.thread.fetch(threadPk)
      const tx = await program.methods.likeThread({funny:{}}).accounts({
        likeAuthority: alice.publicKey,
        thread: threadPk,
      }).signers([alice]).rpc({commitment:"confirmed"})
      // console.log(tx)
      const commentData = await program.account.like.fetch(likePk)
      const threadDataAfterLiked  = await program.account.thread.fetch(threadPk)
      assert.strictEqual(commentData.bump.toString(), like_bump.toString())
      assert.strictEqual(commentData.likeAuthor.toString(), alice.publicKey.toString())
      assert.strictEqual(commentData.parent.toString(), threadPk.toString())
      assert.deepStrictEqual(commentData.reaction, {funny:{}})
      assert.strictEqual(Number(threadDataBeforeLiked.likes) + 1, Number(threadDataAfterLiked.likes))

    })
    it("Alice try to give more than 1 like in 1 post", async()=>{
      let shouldFail = false
      try{

        const [threadPk, thread_bump] = await getThreatAddress(title, bob.publicKey, program.programId)
        const [likePk, like_bump] = await getLikeAddress(alice.publicKey, threadPk, program.programId)
        const tx = await program.methods.likeThread({like:{}}).accounts({
          likeAuthority: alice.publicKey,
          thread: threadPk,
        }).signers([alice]).rpc({commitment:"confirmed"})
      }catch(error){
        assert.isTrue(SolanaError.contains(error.logs, "already in use"), error.logs)
        shouldFail = true
      }
      assert.strictEqual(shouldFail, true)
    })


  })

});
function stringToUtf8ByteArray(inputString: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(inputString);
}

// Function to pad a byte array with zeroes to a specified length
function padByteArrayWithZeroes(byteArray: Uint8Array, length: number): Uint8Array {
  if (byteArray.length >= length) {
    return byteArray;
  }

  const paddedArray = new Uint8Array(length);
  paddedArray.set(byteArray, 0);
  return paddedArray;
}


async function airdrop(connection: any, address: any, amount = 1000000000) {
  await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}

function getThreatAddress(topic: string, author: PublicKey, programID: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode(topic),
      anchor.utils.bytes.utf8.encode(THREAD_SEED),
      author.toBuffer()
    ], programID);
}

function getCommentAddress(comment_content: string, author: PublicKey, parent: PublicKey, programID: PublicKey){
  let hexString = crypto.createHash('sha256').update(comment_content, 'utf-8').digest('hex');
  let content_seed = Uint8Array.from(Buffer.from(hexString, 'hex'));
  return PublicKey.findProgramAddressSync([
    author.toBuffer(),
    anchor.utils.bytes.utf8.encode(COMMENT_SEED),
    content_seed,
    parent.toBuffer()
  ], programID)
}

function getLikeAddress(author: PublicKey, parent: PublicKey, programID: PublicKey){
  return PublicKey.findProgramAddressSync([
    anchor.utils.bytes.utf8.encode(LIKE_SEED),
    author.toBuffer(),
    parent.toBuffer()
  ], programID)
}

class SolanaError {
  static contains(logs, error): boolean {
    const match = logs?.filter(s => s.includes(error));
    return Boolean(match?.length)
  }
}