"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import RedditCard from "@/components/ui/RedditCard";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  commentMutate,
  deleteComments,
  getCommentsForThread,
} from "@/services/comment.service";
import { getSpesificLike } from "@/services/like.service";
import { getSpesificThreads } from "@/services/thread.service";
import { Comment } from "@/types/comment";
import { Thread } from "@/types/thread";
import {
  getCommentAddress,
  getDummyWallet,
  getLikeAddress,
  getProgram,
} from "@/utils/program";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Trash } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function Page() {
  const params = useParams();
  const { toast } = useToast();
  const router = useRouter();
  const address = useMemo(() => {
    if (!params.address) {
      return;
    }
    try {
      return new PublicKey(params.address);
    } catch (e) {
      console.log(`Invalid public key`, e);
    }
  }, [params]);
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const program = useMemo(() => {
    if (connection) {
      return getProgram(connection, wallet ?? getDummyWallet());
    }
  }, [wallet]);
  const [thread, setThread] = useState<Thread | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  if (!address) {
    toast({
      title: "Error loading thread address",
      variant: "destructive",
    });
    router.push("/");
  }

  useEffect(() => {
    if (address && program) {
      const fetchThreads = async () => {
        const thread = await getSpesificThreads(program, address);
        if (thread) {
          let isLiked = false;
          if (wallet) {
            const [likePk] = getLikeAddress(
              wallet.publicKey,
              address,
              program.programId
            );
            const like = await getSpesificLike(program, likePk);
            isLiked =
              !!like &&
              like.likeAuthor.toString() === wallet.publicKey.toString();
          }
          const threadObj = new Thread(
            thread.threadAuthor,
            thread.title,
            thread.content,
            thread.tags,
            thread.likes,
            address,
            isLiked
          );
          setThread(threadObj);
        }
      };
      const fetchCommentOnThreads = async () => {
        const comments = await getCommentsForThread(
          program,
          connection,
          program.programId,
          address
        );
        if (!comments) return;
        const commentsObj = await Promise.all(
          comments.map(async (comment) => {
            return new Comment(
              comment.account!.commentAuthor,
              comment.account!.comment,
              comment.pubkey,
              comment.account!.parent
            );
          })
        );
        setComments(commentsObj);
      };
      fetchThreads();
      fetchCommentOnThreads();
    }
  }, [program]);

  return (
    <div className="h-full w-full px-10 py-20 space-y-5">
      {thread && (
        <>
          <RedditCard thread={thread} isLink={false} />
          <Card>
            <CardHeader>
              <AddCommentComponent parent={thread?.address} />
            </CardHeader>
            {/* <CardContent></CardContent> */}
            <CardContent>
              {comments.map((comment) => {
                const onClickDeleteComment = async () => {
                  if (wallet && program) {
                    const tx = await deleteComments(
                      program,
                      comment.address,
                      wallet.publicKey
                    );
                    if (tx) {
                      toast({
                        title: "Successfully deleted comment",
                      });
                      setTimeout(() => {
                        window.location.reload();
                      }, 2000);
                    } else {
                      toast({
                        title: "Oops, Something went wrong",
                        variant: "destructive",
                      });
                    }
                  }
                  if (!wallet) {
                    toast({
                      title: "Please connect your wallet",
                    });
                  }
                };
                return (
                  <div
                    key={comment.address.toString()}
                    className="rounded-md shadow-lg border border-gray-200 p-4 flex"
                  >
                    <div className="flex flex-col">
                      <h1 className="font-bold">
                        {comment.commentAuthor.toString()}
                      </h1>
                      <p>{comment.comment}</p>
                    </div>
                    <div className="w-full flex items-center justify-end">
                      {comment.commentAuthor.toString() ===
                        wallet?.publicKey.toString() && (
                        <Button
                          onClick={onClickDeleteComment}
                          variant={`destructive`}
                        >
                          <Trash />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
interface AddCommentComponentProps {
  parent: PublicKey;
}
function AddCommentComponent({ parent }: AddCommentComponentProps) {
  const [comment, setComment] = useState<string>("");
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const program = useMemo(() => {
    if (wallet && connection) {
      return getProgram(connection, wallet);
    }
  }, [wallet]);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const onClickAddComment = async () => {
    if (wallet && program) {
      const [commentPkey] = getCommentAddress(
        comment,
        wallet.publicKey,
        parent,
        program.programId
      );
      const tx = await commentMutate(
        program,
        comment,
        commentPkey,
        wallet.publicKey,
        parent
      );
      if (tx) {
        toast({
          title: "Successfully added a comment",
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Oops, Something went wrong !",
          variant: "destructive",
        });
      }
    }
    if (!wallet) {
      toast({
        title: "Not authenticated",
        description: "Please select your wallet",
      });
    }
  };

  return (
    <div className="flex space-x-2 items-center">
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add a comment.."
      />
      <Button onClick={onClickAddComment}>Comment</Button>
    </div>
  );
}
