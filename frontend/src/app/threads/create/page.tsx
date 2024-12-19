"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChipsInput } from "@/components/ui/chips-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getProgram, getThreadAddress } from "@/utils/program";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useMemo, useState } from "react";
import * as anchor from "@coral-xyz/anchor";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function Page() {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { toast } = useToast();
  const router = useRouter();
  const program = useMemo(() => {
    if (connection && wallet) {
      return getProgram(connection, wallet);
    }
  }, [wallet]);
  const handleChipsChange = (newChips: string[]) => {
    setTags(newChips);
    console.log("current chips : ", newChips);
  };

  const createThreadOnClick = async () => {
    if (program && wallet) {
      try {
        const [threadPk, threadBump] = getThreadAddress(
          title,
          wallet.publicKey,
          program.programId
        );
        console.log(threadPk);
        const tx = await program.methods
          .initialize(title, content, tags)
          .accounts({
            threadAuthority: wallet.publicKey,
            //@ts-ignore
            thread: threadPk,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([])
          .rpc({ commitment: "confirmed" });
        toast({
          title: "Transaction send successfully",
        });
        router.push("/  ");
        console.log("Transaction successful:", tx);
      } catch (error) {
        toast({
          title: "Oops, something went wrong",
          variant: "destructive",
          description: "Something went wrong...",
        });
        console.error(error);
      }
    }
  };

  return (
    <>
      <div className="h-full w-full flex items-center justify-center">
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Create new threads</CardTitle>
            <CardDescription>
              {"Let the whole world knows what's on your mind"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    id="title"
                    placeholder="Title thread"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="h-24"
                    placeholder="What's on your mind ?"
                  />
                </div>
                <div>
                  <Label htmlFor="chips">Tags</Label>
                  <ChipsInput
                    name="chips"
                    placeholder="Type and press Enter to add Tags"
                    onChipsChange={handleChipsChange}
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button onClick={createThreadOnClick}>Create thread</Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
