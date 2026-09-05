import type { NextPage } from "next";
import Head from "next/head";
import FriendsPage from "@/features/friends/components/FriendsPage";

const Friends: NextPage = () => {
  return (
    <>
      <Head>
        <title>Teman — Waitplay</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <FriendsPage />
    </>
  );
};

export default Friends;
