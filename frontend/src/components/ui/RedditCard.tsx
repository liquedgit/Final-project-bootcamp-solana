import { Thread } from "@/types/thread";
import { Card, CardContent, CardFooter, CardHeader } from "./card";
import { useToast } from "@/hooks/use-toast";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { cleanString, getProgram } from "@/utils/program";
import { likeMutate, unlikeMutate } from "@/services/like.service";
import { Badge } from "./badge";
import { Heart } from "lucide-react";
import Link from "next/link";

interface RedditCardProps {
  thread: Thread;
  isLink?: boolean;
}
export default function RedditCard({ thread, isLink = true }: RedditCardProps) {
  const { toast } = useToast();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const program = useMemo(() => {
    if (wallet && connection) {
      return getProgram(connection, wallet);
    }
  }, [wallet]);
  const likeOnClick = async () => {
    if (wallet && program) {
      const tx = await likeMutate(program, wallet.publicKey, thread.address);
      if (tx) {
        toast({
          title: "Succesfully liked a thread",
        });
        thread.isLiked = !thread.isLiked;
        thread.likes = thread.likes + 1;
      } else {
        toast({
          title: "Oops ! Something went wrong",
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
  const unLikeOnClick = async () => {
    if (wallet && program) {
      console.log("Unliked");
      const tx = await unlikeMutate(program, wallet.publicKey, thread.address);
      console.log(tx);
      if (tx) {
        toast({
          title: "Successfull unliked threads",
        });
        thread.likes = thread.likes - 1;
        thread.isLiked = false;
      } else {
        toast({
          title: "Oops ! Something went wrong",
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

  const content = (
    <>
      <CardHeader>
        <h1 className="text-2xl font-bold text-left">{thread.title}</h1>
      </CardHeader>
      <CardContent className="text-left">
        <div className="space-x-2">
          {cleanString(thread.tags).map((tag) => (
            <Badge variant={`default`} key={tag}>
              {tag}
            </Badge>
          ))}
        </div>
        <p>{thread.content.slice(0, Math.floor(thread.content.length / 2))}</p>
      </CardContent>
    </>
  );

  return (
    <div key={thread.title}>
      <Card>
        {isLink ? (
          <Link href={`threads/${thread.address}`}>{content}</Link>
        ) : (
          content
        )}
        <CardFooter className="flex justify-end">
          <div className="flex items-center justify-center space-x-1">
            <Heart
              className="cursor-pointer"
              fill={thread.isLiked ? "red" : "none"}
              onClick={thread.isLiked ? unLikeOnClick : likeOnClick}
            />
            <p>{thread.likes}</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
