import type { NextPage } from "next";
import Head from "next/head";
import GomokuPlay from "@/features/gomoku/components/GomokuPlay";

const Gomoku: NextPage = () => {
  return (
    <>
      <Head>
        <title>Gomoku</title>
        <meta name="description" content="Gomoku lima berjajar di papan lima belas kali lima belas melawan bot" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      <GomokuPlay />
    </>
  );
};

export default Gomoku;
