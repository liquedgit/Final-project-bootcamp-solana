"use client";

import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { AppHero } from "../ui/ui-layout";
import { useEffect, useMemo, useState } from "react";
import {
  cleanString,
  getDummyWallet,
  getLikeAddress,
  getProgram,
  getThreadAddress,
} from "@/utils/program";
import { getAllThreads, getSpesificThreads } from "@/services/thread.service";
import { Thread } from "@/types/thread";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import Link from "next/link";
import { Heart } from "lucide-react";
import {
  getAllLike,
  getSpesificLike,
  likeMutate,
  unlikeMutate,
} from "@/services/like.service";
import { useToast } from "@/hooks/use-toast";
import { LIKE_SEED } from "@/utils/constant";
import { Badge } from "../ui/badge";
import RedditCard from "../ui/RedditCard";

const links: { label: string; href: string }[] = [
  { label: "Solana Docs", href: "https://docs.solana.com/" },
  { label: "Solana Faucet", href: "https://faucet.solana.com/" },
  { label: "Solana Cookbook", href: "https://solanacookbook.com/" },
  { label: "Solana Stack Overflow", href: "https://solana.stackexchange.com/" },
  {
    label: "Solana Developers GitHub",
    href: "https://github.com/solana-developers/",
  },
];

export default function DashboardFeature() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const program = useMemo(() => {
    if (connection) {
      console.log(wallet);
      return getProgram(connection, wallet ?? getDummyWallet());
    }
  }, [wallet]);
  const { toast } = useToast();
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    if (program) {
      const fetchAllThreads = async () => {
        try {
          const threads = await getAllThreads(program);
          if (!threads) return;

          const threadsObj = await Promise.all(
            threads.map(async (thread) => {
              let isLiked = false;

              if (wallet) {
                const [likePk] = getLikeAddress(
                  wallet.publicKey,
                  thread.publicKey,
                  program.programId
                );

                const like = await getSpesificLike(program, likePk);

                isLiked =
                  !!like &&
                  like.likeAuthor.toString() === wallet.publicKey.toString();
              }

              return new Thread(
                thread.account.threadAuthor,
                thread.account.title,
                thread.account.content,
                thread.account.tags,
                thread.account.likes,
                thread.publicKey,
                isLiked
              );
            })
          );

          setThreads(threadsObj);
        } catch (error) {
          console.error("Error fetching threads:", error);
        }
      };

      fetchAllThreads();
    }
  }, [program, wallet]);

  return (
    <div>
      <AppHero
        title="Reddit D-App"
        subtitle="All in One. Decentralized Reddit Application."
      />
      <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center">
        {threads.length == 0 && (
          <>
            <p className="text-2xl">Currently there is no threads available.</p>
          </>
        )}
        <div className="flex-auto space-y-8">
          {threads.map((thread) => {
            return (
              <RedditCard thread={thread} key={thread.address.toString()} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
